// src/services/queue/QueueService.js
import { eventBus, EventTypes } from '../events/EventBus';
import { performanceMonitor } from '../performance/PerformanceMonitor';

class QueueService {
  constructor() {
    this.queues = new Map();
    this.priorities = {
      HIGH: 0,
      MEDIUM: 1,
      LOW: 2
    };
    this.status = {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
      RETRYING: 'retrying'
    };
    this.maxRetries = 3;
    this.retryDelays = [1000, 5000, 15000]; // Délais progressifs
  }

  createQueue(queueName, options = {}) {
    if (this.queues.has(queueName)) {
      throw new Error(`Queue ${queueName} already exists`);
    }

    this.queues.set(queueName, {
      name: queueName,
      tasks: [],
      processing: false,
      options: {
        concurrency: options.concurrency || 1,
        retryAttempts: options.retryAttempts || this.maxRetries,
        timeout: options.timeout || 30000,
        ...options
      }
    });

    console.log(`Queue ${queueName} created with options:`, options);
  }

  async addTask(queueName, task, priority = this.priorities.MEDIUM) {
    if (!this.queues.has(queueName)) {
      this.createQueue(queueName);
    }

    const queue = this.queues.get(queueName);
    const taskId = `${queueName}_${Date.now()}_${Math.random().toString(36)}`;

    const taskWrapper = {
      id: taskId,
      task,
      priority,
      status: this.status.PENDING,
      attempts: 0,
      added: Date.now(),
      timeout: null
    };

    queue.tasks.push(taskWrapper);
    queue.tasks.sort((a, b) => a.priority - b.priority);

    eventBus.emit(EventTypes.QUEUE.TASK_ADDED, {
      queueName,
      taskId,
      priority
    });

    if (!queue.processing) {
      this.processQueue(queueName);
    }

    return taskId;
  }

  async processQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue || queue.processing) return;

    queue.processing = true;
    
    while (queue.tasks.length > 0) {
      const processing = new Set();
      
      while (processing.size < queue.options.concurrency && queue.tasks.length > 0) {
        const task = queue.tasks.shift();
        processing.add(this.processTask(queueName, task));
      }

      await Promise.allSettled(Array.from(processing));
    }

    queue.processing = false;
  }

  async processTask(queueName, taskWrapper) {
    const queue = this.queues.get(queueName);
    const perfMark = performanceMonitor.startMeasure(`task_${queueName}`);

    try {
      taskWrapper.status = this.status.PROCESSING;
      
      // Ajouter un timeout
      const timeoutPromise = new Promise((_, reject) => {
        taskWrapper.timeout = setTimeout(() => {
          reject(new Error('Task timeout'));
        }, queue.options.timeout);
      });

      // Exécuter la tâche avec timeout
      const result = await Promise.race([
        taskWrapper.task(),
        timeoutPromise
      ]);

      clearTimeout(taskWrapper.timeout);
      taskWrapper.status = this.status.COMPLETED;

      eventBus.emit(EventTypes.QUEUE.TASK_COMPLETED, {
        queueName,
        taskId: taskWrapper.id,
        duration: performanceMonitor.endMeasure(perfMark)
      });

      return result;

    } catch (error) {
      clearTimeout(taskWrapper.timeout);
      taskWrapper.attempts++;

      if (taskWrapper.attempts < queue.options.retryAttempts) {
        // Réessayer avec délai
        taskWrapper.status = this.status.RETRYING;
        const delay = this.retryDelays[taskWrapper.attempts - 1];
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        queue.tasks.push(taskWrapper);
        
        eventBus.emit(EventTypes.QUEUE.TASK_RETRY, {
          queueName,
          taskId: taskWrapper.id,
          attempt: taskWrapper.attempts,
          error: error.message
        });

      } else {
        taskWrapper.status = this.status.FAILED;
        
        eventBus.emit(EventTypes.QUEUE.TASK_FAILED, {
          queueName,
          taskId: taskWrapper.id,
          error: error.message,
          attempts: taskWrapper.attempts
        });

        performanceMonitor.endMeasure(perfMark);
        throw error;
      }
    }
  }

  getQueueStatus(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue) return null;

    return {
      name: queueName,
      pending: queue.tasks.length,
      processing: queue.processing,
      tasks: queue.tasks.map(task => ({
        id: task.id,
        status: task.status,
        attempts: task.attempts,
        added: task.added,
        priority: task.priority
      }))
    };
  }

  pauseQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (queue) {
      queue.processing = false;
      eventBus.emit(EventTypes.QUEUE.QUEUE_PAUSED, { queueName });
    }
  }

  resumeQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (queue && !queue.processing && queue.tasks.length > 0) {
      this.processQueue(queueName);
      eventBus.emit(EventTypes.QUEUE.QUEUE_RESUMED, { queueName });
    }
  }

  clearQueue(queueName) {
    const queue = this.queues.get(queueName);
