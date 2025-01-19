interface DataList {
  kind: string
 	key: string
 	subkey: string | null
 	timestamps: number[]
 	values: number[]
}

interface GetDataResponse {
	start: number
	end: number
  data: {[key: string]: DataList[]}
}
