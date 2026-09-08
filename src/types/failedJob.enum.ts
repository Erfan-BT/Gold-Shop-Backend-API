export enum FailedJobStatus {
    FAILED = 'FAILED',
    DONE = 'DONE',
    CANCELED = 'CANCELED'
}

export enum FailedJobSort {
    NEWEST = 'NEWEST',
    OLDEST = 'OLDEST',
    PRIORITY_ASC = 'PRIORITY_ASC',
    PRIORITYE_DESC = 'PRIORITY_DESC',
    QUEUE_ASC = 'QUEUE_ASC',
    QUEUE_DESC = 'QUEUE_DESC',
    JOB_NAME_ASC = "JOB_NAME_ASC",
    JOB_NAME_DESC = "JOB_NAME_DESC",
}