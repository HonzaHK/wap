rand = function(){
	return Math.floor(Math.random() * 10) + 1 ; 
}
createTableElem = function(row,col){
	var t = document.createElement("table");
	t.setAttribute("id", "wapTable");
	for(var r=0;r<row;r++){
		var tr = document.createElement("tr");
		tr.setAttribute("class", "wapRow")
		for(var c=0;c<col;c++){
			var td = document.createElement("td");
			td.innerHTML = rand();
			td.setAttribute("class", "wapCell");
			td.addEventListener("click", function (e) {
				var cell = e.target;
				cell.classList.toggle("selected");
			});
			tr.appendChild(td);
		}
		t.appendChild(tr);
	}

	return t;
}

createCellContElem = function(){

	var cc = {};

	cc.c_text = document.createElement("input");
	cc.c_text.setAttribute("type","text");

	cc.c_text.addEventListener("input",function (e) {
		wt.setCurrentCellText(this.value);
	});

	cc.elem = document.createElement("div");
	cc.elem.appendChild(cc.c_text)

	cc.setInputText = function(text){
		cc.c_text.value = text;
	}


	return cc;
}

const KEYc_LEFT=37, KEYc_UP=38, KEYc_RIGHT=39, KEYc_DOWN=40;
document.onkeydown = function(e){
	if(e.keyCode==KEYc_LEFT || e.keyCode==KEYc_UP || e.keyCode==KEYc_RIGHT || e.keyCode==KEYc_DOWN){
		wt.keyDown(e.keyCode);
		return false;
	}
	
	return true;
};

var wt = {
	r_cnt: 0,
	c_cnt: 0,
	elem: null,

	r_curr: 0,
	c_curr: 0,
	keyDown: function(keyCode){
		var newRow=wt.r_curr, newCol=wt.c_curr;

		if (keyCode == KEYc_LEFT && wt.c_curr!=0) {
			newCol--;
		}
		else if (keyCode == KEYc_UP && wt.r_curr!=0) { 
			newRow--;
		}
		else if (keyCode == KEYc_RIGHT && wt.c_curr!=wt.c_cnt-1) { 
			newCol++;
		}
		else if (keyCode == KEYc_DOWN && wt.r_curr!=wt.r_cnt-1) { 
			newRow++;
		}
		else{
			return;
		}

		wt.setCurrentCell(newRow,newCol);
	},
	getCell: function(r,c){
		return wt.elem.rows[r].cells[c];
	},
	getCurrentCell: function(){
		return wt.getCell(wt.r_curr,wt.c_curr);
	},
	setCurrentCell: function(r,c){
		var curr_cell = wt.getCurrentCell();
		curr_cell.classList.toggle("currentCell");
		
		wt.forceSetCurrentCell(r,c);
	},
	forceSetCurrentCell: function(r,c){
		tgt_cell = wt.getCell(r,c);
		tgt_cell.classList.toggle("currentCell");
		wt.r_curr = r;
		wt.c_curr = c;

		wt.cell_cont.setInputText(tgt_cell.innerHTML);
	},
	setCurrentCellText: function(text){
		var curr_cell = wt.getCurrentCell();
		curr_cell.innerHTML = text;
	},
	initCurrentCell: function() {
		var t = wt.elem;
		for(var r=0;r<t.r_cnt;r++){
			for(var c=0;c<tr.c_cnt;c++){
				tgt_cell = wt.getCell(r,c);
				tgt_cell.classList.remove("currentCell");
			}
		}

		wt.forceSetCurrentCell(0,0);
	}


}

initTable = function(wt,r,c){
	wt.r_cnt= r;
	wt.c_cnt= c;
	wt.elem= createTableElem(r,c);
	wt.cell_cont= createCellContElem();

	wt.initCurrentCell();
}



document.addEventListener('DOMContentLoaded', function () {
	var container = document.getElementById("container");
	initTable(wt,5,3);
	container.appendChild(wt.elem);
	container.appendChild(wt.cell_cont.elem);
});
