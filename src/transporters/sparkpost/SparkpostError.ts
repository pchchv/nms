export interface SparkpostError {
    statusCode: number
    errors: { message: string, description: string }[]
}