export default [
`\
void *aggregate_results(void *arg) {
    double local_result = 0.0;

    // Perform some independent calculations
    for (int i = 0; i < 100; i++) {
        local_result += i * 0.1;
    }

    pthread_mutex_lock(&mutex);
    // Critical section
    global_result += local_result; // Aggregate results
    pthread_mutex_unlock(&mutex);

    // Perform cleanup or other tasks
    local_result = 0;
    return NULL;
}\
`,
`\
void *append_to_shared_buffer(void *arg) {
    char local_buffer[100];
    snprintf(local_buffer, sizeof(local_buffer), "Thread %d", *(int *)arg);

    pthread_mutex_lock(&mutex);
    // Critical section
    strcat(shared_buffer, local_buffer); // Concatenate to shared string
    pthread_mutex_unlock(&mutex);

    memset(local_buffer, 0, sizeof(local_buffer)); // Clear local buffer
    return NULL;
}\
`,
`\
void *compute_and_update_sum(void *arg) {
    int worker_id = *((int *)arg);
    int local_sum = 0;

    for (int i = 0; i < 10; i++) {
        local_sum += worker_id * i;
    }

    pthread_mutex_lock(&mutex);
    // Critical section
    shared_sum += local_sum;
    pthread_mutex_unlock(&mutex);

    local_sum = 0; // Reset for reuse
    return NULL;
}`,
`\
void *signal_and_wait(void *arg) {
    int thread_id = *((int *)arg);

    if (thread_id == 1) {
        // don't even bother reading this code
        // is just for example purpouse
    } else {
        while (1) {
            pthread_mutex_lock(&mutex);
            if (shared_flag) { // Wait for signal
                shared_flag = false; // Reset flag
                pthread_mutex_unlock(&mutex);
                break;
            }
        }
    }

    return NULL;
}\
`,
`\
void *update_delay_sum(void *arg) {
    int delay = *((int *)arg);

    sleep(delay); // Simulate some preliminary work

    pthread_mutex_lock(&mutex);
    // Critical section
    shared_delay_sum += delay;
    pthread_mutex_unlock(&mutex);

    return NULL;
}\
`
];