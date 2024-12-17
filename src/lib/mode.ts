export const Mode = {
	CHECK: 0,
	RETIRE: 1,
	SKIP: 2,
}

export type Mode = (typeof Mode)[keyof typeof Mode];
