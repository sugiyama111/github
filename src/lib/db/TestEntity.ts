
export default class TestEntity {
	id!:string;
	
	constructor(id:string) {
		console.log('test constructor');
		console.log('test after super');

		this.id = id;
	}
}
