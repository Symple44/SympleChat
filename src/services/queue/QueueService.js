// src/services/queue/QueueService.js
class QueueService {
  constructor() {
    this.queues = new Map();
    this.priorities = {
      HIGH: 0,
      MEDIUM: 1,
      LOW: 2
    };
  }

  createQueue(queueName, options = {}) {
    if (this.queues.has(queueName)) {
      throw new Error(`Queue ${queueName} already exists`);
    }

    this.queues.set(queueName, {
      tasks: [],
      isProcessing: false,
      options: {
        concurrency: options.concurrency || 1,
        retryAttempts: options.retryAttempts || 3,
        retryDelay: options.retryDelay || 1000,
        timeout: options.timeout || 30000
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
      const task = queue.tasks.shift();
      try {
        await this.processTask(task, queue.options);
      } catch (error) {
        console.error(`Task ${task.id} failed:`, error);
      }
    }

    queue.isProcessing = false;
  }

  async processTask(task, options) {
    try {
      task.status = 'processing';
      
      const result = await Promise.race([
        task.task(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Task timeout')), options.timeout)
        )
      ]);

      task.status = 'completed';
      return result;

    } catch (error) {
      task.attempts++;
      task.status = 'failed';

      if (task.attempts < options.retryAttempts) {
        await new Promise(resolve => 
          setTimeout(resolve, options.retryDelay * Math.pow(2, task.attempts - 1))
        );
        return this.processTask(task, options);
      }

      throw error;
    }
  }

  getQueueStatus(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue) return null;

    return {
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
    }
  }
}

export const queueService = new QueueService();
export default queueService;
