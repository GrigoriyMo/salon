var fs = require('fs');
const options = {
	host:'127.0.0.1',
	user:'root',
	password:'',
	database:'yatest'
};

var mysql = require('sync-mysql');

var db = new mysql({
    host: options.host,
    user: options.user,
    password: options.password,
    database: options.database
});

var data = [
	{timestamp:1554012838, money: 1.25, worker_id: "user_2"},
	{timestamp:1551007089, money: 0.82, worker_id: "user_3"},
	{timestamp:1549195759, money: 1.59, worker_id: "user_2"},
	{timestamp:1554011808, money: 0.97, worker_id: "user_3"},
	{timestamp:1550926107, money: 0.8, worker_id: "user_3"},
	{timestamp:1550547342, money: 1.21, worker_id: "user_3"},
	{timestamp:1550528508, money: 1.16, worker_id: "user_6"},
	{timestamp:1548067037, money: 1.25, worker_id: "user_7"}
];
		

function createData(timestamp, money, worker_id){
	var sql = `insert into sql_bonus_tbl
	 (timestamp, money, worker_id) VALUES 
	 (${timestamp}, ${money}, '${worker_id}');`;
	console.log(sql);
	db.query(sql);
}

function createDataMoney(taskid, timestamp, money, worker_id){
	var sql = `insert into sql_money_btl
	 (task_id,timestamp, money, worker_id) VALUES 
	 ("${taskid}",${timestamp}, ${money}, '${worker_id}');`;
	console.log(sql);
	db.query(sql);	
}

class Row{
	constructor(timestamp, money, worker_id){
		this.timestamp = timestamp;
		this.money = money;
		this.worker_id = worker_id;
	}
}

class RowTwo{
	constructor(task_id, timestamp, money, worker_id){
		this.task_id = task_id;
		this.timestamp = timestamp;
		this.money = money;
		this.worker_id = worker_id;
	}
}

fs.readFile('sql_bonus_tbl.tsv','utf8', function(err, data) {
	var newdata = data.split(";");
	var rows = new Array();
	for(var i = 0; i < newdata.length/3; i++){
		if(i%3===0){
			rows[i] = new Row();
			rows[i].timestamp = newdata[i];
			rows[i].money = newdata[i+1];
			rows[i].worker_id = newdata[i+2];		
		};
	};
	for(key in rows){
		createData(rows[key].timestamp, rows[key].money, rows[key].worker_id);
	};
});

/*fs.readFile('sql_money_tbl.tsv','utf8',function(err,data){
	var newdata = data.split(";");
	var rows = new Array();
	for(var i = 0; i < newdata.length/3; i++){
		if(i%4===0){
			rows[i] = new RowTwo();
			rows[i].task_id = newdata[i];
			rows[i].timestamp = newdata[i+1];
			rows[i].money = newdata[i+2];
			rows[i].worker_id = newdata[i+3];
		}
	}
	for(key in rows){
		createDataMoney(rows[key].task_id, rows[key].timestamp, rows[key].money, rows[key].worker_id);
	}
});*/