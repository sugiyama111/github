
type MemberParams = {
	memberCode: string;
	bibNumber: string;
	name: string;
	divisionName: string;
	categoryName: string;
	gender: string;
	age: number;
	nation: string;
	startTime: string;
}

export class Member {
	public memberCode: string;
	public bibNumber: string;
	public name: string;
	public divisionName: string;
	public categoryName: string;
	public gender: string;
	public age: number;
	public nation: string;
	public startTime: string;

	constructor({memberCode, bibNumber, name, divisionName, categoryName, gender, age, nation, startTime }: MemberParams) {
		this.memberCode = memberCode;
		this.bibNumber = bibNumber;
		this.name = name;
		this.divisionName = divisionName;
		this.categoryName = categoryName;
		this.gender = gender;
		this.age = age;
		this.nation = nation;
		this.startTime = startTime;
	}
	
	toEntity() {
		return {
			member_code: this.memberCode,
			bib_number: this.bibNumber,
			name: this.name,
			division: this.divisionName,
			category: this.categoryName,
			gender: this.gender,
			age: this.age,
			nation: this.nation,
			start_time: this.startTime,
		};
	}
}
