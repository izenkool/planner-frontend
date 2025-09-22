new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        tasks: [],
        newTask: {
            title: '',
            description: '',
            priority: 1,
            tags: [],
            repeat: false,
            recurrenceRule: {
                recurrenceType: 'daily',
                interval: 1,
                daysOfWeek: 0,
                daysOfMonth: 0,
            }
        },
        newTag: '',
        showAddTaskModal: false,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        weekDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        apiHost: 'http://localhost:8080',
    },
    methods: {
        fetchTasks(page = 1) {
            fetch(`${this.apiHost}/api/tasks?page=${page}&limit=${this.limit}`)
                .then(response => response.json())
                .then(data => {
                    this.tasks = data.tasks.map(task => ({
                        ...task,
                        priority: ['Low', 'Medium', 'High'][task.priority] || 'Medium',
                        tags: task.tags ? task.tags.map(t => t.name) : []
                    }));
                    this.totalPages = Math.ceil(data.total / this.limit);
                    this.currentPage = page;
                });
        },
        addTask() {
            let taskData = { ...this.newTask };
            if (!taskData.repeat) {
                delete taskData.recurrenceRule;
            }

            fetch(`${this.apiHost}/api/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            })
            .then(() => {
                this.newTask.title = '';
                this.newTask.description = '';
                this.newTask.priority = 1;
                this.newTask.tags = [];
                this.newTask.repeat = false;
                this.newTask.recurrenceRule = {
                    recurrenceType: 'daily',
                    interval: 1,
                    daysOfWeek: 0,
                    daysOfMonth: 0,
                };
                this.showAddTaskModal = false;
                this.fetchTasks(this.currentPage);
            });
        },
        deleteTask(taskId) {
            fetch(`${this.apiHost}/api/tasks/` + taskId, {
                method: 'DELETE'
            })
            .then(() => {
                this.fetchTasks(this.currentPage);
            });
        },
        addTag() {
            if (this.newTag.trim() !== '' && !this.newTask.tags.includes(this.newTag.trim())) {
                this.newTask.tags.push(this.newTag.trim());
                this.newTag = '';
            }
        },
        removeTag(index) {
            this.newTask.tags.splice(index, 1);
        },
        toggleComplete(task) {
            fetch(`${this.apiHost}/api/tasks/` + task.Id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(updatedTask => {
                const index = this.tasks.findIndex(t => t.Id === updatedTask.Id);
                if (index !== -1) {
                    this.$set(this.tasks, index, {
                        ...updatedTask,
                        Priority: ['Low', 'Medium', 'High'][updatedTask.Priority] || 'Medium',
                        Tags: updatedTask.Tags ? updatedTask.Tags.map(t => t.Name) : []
                    });
                }
            })
            .catch(error => console.error('Error updating task:', error));
        },
        openAddTaskModal() {
            this.showAddTaskModal = true;
        },
        closeAddTaskModal() {
            this.showAddTaskModal = false;
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.fetchTasks(this.currentPage + 1);
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.fetchTasks(this.currentPage - 1);
            }
        },
        goToPage(page) {
            this.fetchTasks(page);
        },
        isDaySelected(dayIndex) {
            return this.newTask.recurrenceRule && (this.newTask.recurrenceRule.daysOfWeek & (1 << dayIndex)) !== 0;
        },
        toggleDay(dayIndex) {
            if (this.newTask.recurrenceRule) {
                this.newTask.recurrenceRule.daysOfWeek ^= (1 << dayIndex);
            }
        }
    },
    mounted() {
        this.fetchTasks();
    }
});