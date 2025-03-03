type Success<T> = {
	data: T;
	error?: never;
};

type Failure<E> = {
	data?: never;
	error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
	promise: Promise<T>,
): Promise<Result<T, E>> {
	try {
		const data = await promise;
		return { data };
	} catch (error) {
		return { error: error as E };
	}
}
