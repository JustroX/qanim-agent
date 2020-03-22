export interface Dictionary<T>{
	[key: string]: T
}

export type Map<X,Y> = (obj: X, dt?: number) => Y;
export type Map2<X,Y,Z> = (x: X, y: Y) => Z;