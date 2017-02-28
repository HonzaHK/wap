rand = function(){
	return Math.floor(Math.random() * 10) + 1 ; 
}

function genId(){
	var length = 5;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

createTableElem = function(row,col){
	var t = document.createElement("table");
	t.setAttribute("class", "wapTable");
	for(var r=0;r<row;r++){
		var tr = document.createElement("tr");
		tr.setAttribute("class", "wapRow")
		for(var c=0;c<col;c++){
			var td = document.createElement("td");
			td.innerHTML = rand();
			td.setAttribute("class", "wapCell");
			td.setAttribute("data-row", ""+r);
			td.setAttribute("data-col", ""+c);
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

	var re_head ="^=(ADD|MUL|SUB|DIV|AVG)\\(";
	var re_param = "((\\$[0-9]+:[0-9]+)|([0-9]+))"
	var re_params =re_param+"(,"+re_param+")*";
	var re_tail = "\\)$";
	var re = re_head+re_params+re_tail;
	//test
	//console.log(re)
	//^=(ADD|MUL|SUB|DIV|AVG)\(((\$[0-9]+:[0-9]+)|([0-9]+))(,((\$[0-9]+:[0-9]+)|([0-9]+)))*\)$
	cc.formula_re = new RegExp(re,"m")
	console.log(cc.formula_re.test("=AVG(0-9)"))

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

createCalcElem = function(id){
	var c = document.createElement("div");
	c.classList.add("wapCalc");
	c.setAttribute("id","wcalc_"+id);
	return c;
}

const KEYc_LEFT=37, KEYc_UP=38, KEYc_RIGHT=39, KEYc_DOWN=40;
document.onkeydown = function(e){
	if(e.keyCode==KEYc_LEFT || e.keyCode==KEYc_UP || e.keyCode==KEYc_RIGHT || e.keyCode==KEYc_DOWN){
		activePageElem.keyDown(e.keyCode);
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
	var wc = {}
	wc.e_id = genId();
	wc.elem = createCalcElem(wc.e_id);
	
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

	
	wc.elem.addEventListener("click", function (e) {
		setActivePageElem(wc);
		e = e || window.event;
		var target = e.target || e.srcElement;
		if(target.classList.contains("wapCell")){
			var cell = target;
			cell.classList.toggle("selected");
			var r=cell.getAttribute("data-row");
			var c=cell.getAttribute("data-col");
			wc.t.setCurrentCell(r,c);
			wc.cc.setInputText(wc.t.getCurrentCellText());
		}
	});

	wc.cc.c_text.addEventListener("input",function (e) {
		wc.t.setCurrentCellText(wc.cc.getInputText());
	});

	wc.init= function(){
		wc.t.setCurrentCell(0,0);
		wc.cc.setInputText(wc.t.getCurrentCellText());
	}

	return wc;
}

setActivePageElem = function(tgt_wc){
	unsetActivePageElem();
	activePageElem = tgt_wc;
	tgt_wc.elem.classList.add("activeWc");
}

unsetActivePageElem = function(){
	if(activePageElem!=null){
		activePageElem.elem.classList.remove("activeWc");
	}
}

getActivePageElem = function(){
	return activePageElem;
}
var activePageElem = null;

document.addEventListener('DOMContentLoaded', function () {
	var container = document.getElementById("container");
	let wc = getWapCalc(5,3);
	wc.init();
	container.appendChild(wc.elem);
	wc = getWapCalc(5,3);
	wc.init();
	container.appendChild(wc.elem);
	setActivePageElem(wc);
});
