export class Matrix<T>{
	readonly value: T[][] = [];

	constructor(...args: T[][]){
		for(let row of args)
			this.value.push(row);
	}
	
}