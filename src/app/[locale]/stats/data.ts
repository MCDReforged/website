interface DataList {
  kind: string
 	key: string
 	subkey: string | null
 	timestamps: number[]
 	values: number[]
}

interface DataListDict {
	[key: string]: DataList[]
}

interface GetDataResponse {
	start: number
	end: number
  data: DataListDict | string
}
