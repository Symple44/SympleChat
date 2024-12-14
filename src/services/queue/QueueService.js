// src/services/queue/QueueService.js
import { eventBus, EventTypes } from '../events/EventBus';
import { analytics } from '../analytics/AnalyticsService';
import { performanceMonitor } from '../performance/PerformanceMonitor';

class QueueService {
  constructor() {
    this.queues = new Map();
    this.processing = new Set();
    this.priorities = {
      HIGH: 0,
      MEDIUM: 1,
      LOW: 2
    };
  }

  createQueue(queueName, options = {}) {
    if (this.queues.has(queueName)) {
      throw new Error(`Queue ${queueName} exists already`);
    }

    this.queues.set(queueName, {
      tasks: [],
      isProcessing: false,
      options: {
        concurrency: options.concurrency || 1,
        retryAttempts: options.retryAttempts || 3,
        retryDelay: options.retryDelay || 1000,
        timeout: options.timeout || 30000,
        ...options
      }
    });
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
      attempts: 0,
      added: Date.now(),
      status: 'pending'
    };

    queue.tasks.push(taskWrapper);
    queue.tasks.sort((a, b) => a.priority - b.priority);

    analytics.trackEvent('queue', 'task_added', {
      queueName,
      taskId,
      priority
    });

    if (!queue.isProcessing) {
      this.processQueue(queueName);
    }

    return taskId;
  }

  async processQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue || queue.isProcessing) return;

    queue.isProcessing = true;

    while (queue.tasks.length > 0) {
      const processing = new Set();
      
      while (processing.size < queue.options.concurrency && queue.tasks.length > 0) {
        const task = queue.tasks.shift();
        processing.add(this.processTask(queueName, task));
      }

      await Promise.allSettled(Array.from(processing));
    }

    queue.isProcessing = false;
  }

  async processTask(queueName, taskWrapper) {
    const queue = this.queues.get(queueName);
    const startTime = performance.now();

    try {
      taskWrapper.status = 'processing';
      
      // Ajouter un timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), queue.options.timeout);
      });

      // Exécuter la tâche avec timeout
      const result = await Promise.race([
        taskWrapper.task(),
        timeoutPromise
      ]);

      taskWrapper.status = 'completed';
      const duration = performance.now() - startTime;
      
      performanceMonitor.trackMetric('task_duration', duration, {
        queueName,
        taskId: taskWrapper.id
      });

      eventBus.emit(EventTypes.SYSTEM.INFO, {
        message: `Task ${taskWrapper.id} completed successfully`,
        queueName,
        duration
      });

      return result;

    } catch (error) {
      taskWrapper.attempts++;
      taskWrapper.lastError = error;

      if (taskWrapper.attempts < queue.options.retryAttempts) {
        // Remettre la tâche dans la queue avec délai
        taskWrapper.status = 'retrying';
        setTimeout(() => {
          queue.tasks.push(taskWrapper);
          if (!queue.isProcessing) {
            this.processQueue(queueName);
          }
        }, queue.options.retryDelay * Math.pow(2, taskWrapper.attempts - 1));

        eventBus.emit(EventTypes.SYSTEM.WARNING, {
          message: `Task ${taskWrapper.id} failed, retrying...`,
          queueName,
          attempt: taskWrapper.attempts,
          error: error.message
        });

      } else {
        taskWrapper.status = 'failed';
        
        eventBus.emit(EventTypes.SYSTEM.ERROR, {
          message: `Task ${taskWrapper.id} failed permanently`,
          queueName,
          error: error.message
        });

        analytics.trackError(error, {
          queueName,
          taskId: taskWrapper.id,
          attempts: taskWrapper.attempts
        });
      }

      throw error;
    }
  }

  getQueueStatus(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue) return null;

    return {
      name: queueName,
      pending: queue.tasks.length,
      isProcessing: queue.isProcessing,
      tasks: queue.tasks.map(task => ({
        id: task.id,
        status: task.status,
        attempts: task.attempts,
        added: task.added,
        priority: task.priority
      }))
    };
  }

  clearQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (queue) {
      queue.tasks = [];
      queue.isProcessing = false;
      eventBus.emit(EventTypes.SYSTEM.INFO, {
        message: `Queue ${queueName} cleared`
      });
    }
  }

  pauseQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (queue) {
      queue.isProcessing = false;
      eventBus.emit(EventTypes.SYSTEM.INFO, {
        message: `Queue ${queueName} paused`
      });
    }
  }

  resumeQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (queue && !queue.isProcessing && queue.tasks.length > 0) {
      this.processQueue(queueName);
      eventBus.emit(EventTypes.SYSTEM.INFO, {
        message: `Queue ${queueName} resumed`
      });
    }
  }
}

export const queueService = new QueueService();

// Créer les queues par défaut
queueService.createQueue('messages', {
  concurrency: 1,
  retryAttempts: 3,
  timeout: 10000
});

queueService.createQueue('sync', {
  concurrency: 2,
  retryAttempts: 5,
  timeout: 30000
});

export default queueService;