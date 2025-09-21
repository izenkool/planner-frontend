new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: {
        tasks: [],
        newTask: {
            Title: '',
            Description: '',
            Priority: 1,
            Tags: [],
            Repeat: false,
            RecurrenceRule: {
                RecurrenceType: 'daily',
                Interval: 1,
                DaysOfWeek: 0,
                DaysOfMonth: 0,
            }
        },
        newTag: '',
        showAddTaskModal: false,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        weekDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    },
    methods: {
        fetchTasks(page = 1) {
            fetch(`/api/tasks?page=${page}&limit=${this.limit}`)
                .then(response => response.json())
                .then(data => {
                    this.tasks = data.tasks.map(task => ({
                        ...task,
                        Priority: ['Low', 'Medium', 'High'][task.Priority] || 'Medium',
                        Tags: task.Tags ? task.Tags.map(t => t.Name) : []
                    }));
                    this.totalPages = Math.ceil(data.total / this.limit);
                    this.currentPage = page;
                });
        },
        addTask() {
            let taskData = { ...this.newTask };
            if (!taskData.Repeat) {
                delete taskData.RecurrenceRule;
            }

            fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            })
            .then(() => {
                this.newTask.Title = '';
                this.newTask.Description = '';
                this.newTask.Priority = 1;
                this.newTask.Tags = [];
                this.newTask.Repeat = false;
                this.newTask.RecurrenceRule = {
                    RecurrenceType: 'daily',
                    Interval: 1,
                    DaysOfWeek: 0,
                    DaysOfMonth: 0,
                };
                this.showAddTaskModal = false;
                this.fetchTasks(this.currentPage);
            });
        },
        deleteTask(taskId) {
            fetch('/api/tasks/' + taskId, {
                method: 'DELETE'
            })
            .then(() => {
                this.fetchTasks(this.currentPage);
            });
        },
        addTag() {
            if (this.newTag.trim() !== '' && !this.newTask.Tags.includes(this.newTag.trim())) {
                this.newTask.Tags.push(this.newTag.trim());
                this.newTag = '';
            }
        },
        removeTag(index) {
            this.newTask.Tags.splice(index, 1);
        },
        toggleComplete(task) {
            fetch('/api/tasks/' + task.Id, {
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
            return this.newTask.RecurrenceRule && (this.newTask.RecurrenceRule.DaysOfWeek & (1 << dayIndex)) !== 0;
        },
        toggleDay(dayIndex) {
            if (this.newTask.RecurrenceRule) {
                this.newTask.RecurrenceRule.DaysOfWeek ^= (1 << dayIndex);
            }
        }
    },
    mounted() {
        this.fetchTasks();
    }
});