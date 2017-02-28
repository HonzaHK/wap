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

createCellCont = function(){

	var cc = {};

	cc.c_text = document.createElement("input");
	cc.c_text.setAttribute("type","text");
	cc.c_text.classList.add("ccInput");

	cc.formula_re = /^=(ADD|MUL|SUB|DIV|AVG)\(\${0,1}[0-9]+[\${0,1}[0-9]+]*\)$/m
	console.log(cc.formula_re.test("=AVG(099)"))

	cc.elem = document.createElement("div");
	cc.elem.appendChild(cc.c_text)

	cc.getInputText = function(){
		return cc.c_text.value;
	}
	cc.setInputText = function(text){
		cc.c_text.value = text;
	}


	return cc;
}

createCalcElem = function(){
	var c = document.createElement("div");
	c.classList.add("wapCalc");
	return c;
}

const KEYc_LEFT=37, KEYc_UP=38, KEYc_RIGHT=39, KEYc_DOWN=40;
document.onkeydown = function(e){
	if(e.keyCode==KEYc_LEFT || e.keyCode==KEYc_UP || e.keyCode==KEYc_RIGHT || e.keyCode==KEYc_DOWN){
		wc.keyDown(e.keyCode);
		return false;
	}
	
	return true;
};

getWapTable = function(r,c) {
	return {

		r_cnt: r,
		c_cnt: c,
		elem: createTableElem(r,c),

		r_curr: 0,
		c_curr: 0,
		keyDown: function(keyCode){
			var newRow=this.r_curr, newCol=this.c_curr;

			if (keyCode == KEYc_LEFT && this.c_curr!=0) {
				newCol--;
			}
			else if (keyCode == KEYc_UP && this.r_curr!=0) { 
				newRow--;
			}
			else if (keyCode == KEYc_RIGHT && this.c_curr!=this.c_cnt-1) { 
				newCol++;
			}
			else if (keyCode == KEYc_DOWN && this.r_curr!=this.r_cnt-1) { 
				newRow++;
			}
			else{
				return false;
			}

			this.setCurrentCell(newRow,newCol);
			return true;
		},
		getCell: function(r,c){
			return this.elem.rows[r].cells[c];
		},
		getCurrentCell: function(){
			return this.getCell(this.r_curr,this.c_curr);
		},
		setCurrentCell: function(r,c){
			var curr_cell = this.getCurrentCell();
			curr_cell.classList.remove("currentCell");
			tgt_cell = this.getCell(r,c);
			tgt_cell.classList.add("currentCell");
			this.r_curr = r;
			this.c_curr = c;
		},
		getCurrentCellText: function(){
			var curr_cell = this.getCurrentCell();
			return curr_cell.innerHTML;
		},
		setCurrentCellText: function(text){
			var curr_cell = this.getCurrentCell();
			curr_cell.innerHTML = text;
		}
	}
}

getWapCalc = function(r,c){
	wc = {}
	wc.elem = createCalcElem();
	
	wc.t = getWapTable(r,c);

	wc.cc = createCellCont();
	wc.elem.appendChild(wc.cc.elem);
	wc.elem.appendChild(wc.t.elem);

	wc.keyDown= function(keyCode){
		if(wc.t.keyDown(keyCode)){
			wc.cc.setInputText(wc.t.getCurrentCellText());
			return true;
		}

		return false;
	};

	wc.cc.c_text.addEventListener("input",function (e) {
		wc.t.setCurrentCellText(wc.cc.getInputText());
	});

	wc.init= function(){
		wc.t.setCurrentCell(0,0);
		wc.cc.setInputText(wc.t.getCurrentCellText());
	}

	return wc;
}

document.addEventListener('DOMContentLoaded', function () {
	var container = document.getElementById("container");
	var wc = getWapCalc(5,3);
	wc.init();
	container.appendChild(wc.elem);
});
