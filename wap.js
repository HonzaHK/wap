//VUTBR FIT WAP - Tabulkovy kalkulator
//Author: Jan Kubis/xkubis13

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

function colHeaders(){
	var idx = 96
	var headers = []
	for(var i=0;i<24;i++){
		headers.push(String.fromCharCode(idx+i));
	}
	return headers
}

createCellCont = function(){

	var cc = {};

	cc.c_text = document.createElement("input");
	cc.c_text.setAttribute("type","text");
	cc.c_text.classList.add("ccInput");

	cc.del_btn = document.createElement("input");
	cc.del_btn.setAttribute("type","button");
	cc.del_btn.setAttribute("value","DEL");
	cc.del_btn.classList.add("delBtn");

	cc.elem = document.createElement("div");
	cc.elem.appendChild(cc.del_btn);
	cc.elem.appendChild(cc.c_text);

	cc.getInputText = function(){
		return cc.c_text.value;
	}
	cc.setInputText = function(text){
		cc.c_text.value = text;
	}


	return cc;
}


createTableElem = function(rows){
	var row = rows.length;
	var col = rows[0].cells.length;
	
	var t = document.createElement("table");
	t.setAttribute("class", "wapTable");
	var tr = document.createElement("tr"); //table row for headers
	for (var c=0;c<col+1;c++){ //col headers
		var tdh = document.createElement("th");
		tdh.innerHTML = colHeaders()[c];
		tdh.setAttribute("class", "wapColHeader");
		tr.appendChild(tdh);
	}
	t.appendChild(tr)
	for(var r=0;r<row;r++){
		tr = document.createElement("tr");
		tr.setAttribute("class", "wapRow");
		var trh = document.createElement("th"); //row headers
		trh.innerHTML = r;
		trh.setAttribute("class", "wapRowHeader");
		tr.appendChild(trh);
		for(var c=0;c<col;c++){
			var td = document.createElement("td");
			var cellData = rows[r].cells[c];
			td.innerHTML = cellData.inputText;
			tr.appendChild(cellData.elem);
		}
		t.appendChild(tr);
	}

	return t;
}

createCellElem = function(cell){
	var td = document.createElement("td");
	td.innerHTML = cell.inputText;
	td.setAttribute("class", "wapCell");
	td.setAttribute("data-row", ""+cell.r);
	td.setAttribute("data-col", ""+cell.c);

	return td;
}

initWapTable = function(r,c) {
	var t = {};
	t.r_cnt= r;
	t.c_cnt= c;

	t.r_curr= 0;
	t.c_curr= 0;

	t.rows= [];
	for(let r=0;r<t.r_cnt;r++){
		let row = {};
		row.cells=[];
		for(let c=0;c<t.c_cnt;c++){
			let cell = {};
			cell.r = r;
			cell.c = c;
			cell.inputText = ""+rand();
			if(cell.r==0 && cell.c==0){
				cell.inputText = "=avg(b0,c0)"
			}
			cell.elem = createCellElem(cell);
			row.cells.push(cell);
		}
		t.rows.push(row);
	}

	t.elem= createTableElem(t.rows);

	t.keyDown= function(keyCode){
		var newRow=t.r_curr, newCol=t.c_curr;

		if (keyCode == KEYc_LEFT && t.c_curr!=0) {
			newCol--;
		}
		else if (keyCode == KEYc_UP && t.r_curr!=0) { 
			newRow--;
		}
		else if (keyCode == KEYc_RIGHT && t.c_curr!=t.c_cnt-1) { 
			newCol++;
		}
		else if (keyCode == KEYc_DOWN && t.r_curr!=t.r_cnt-1) { 
			newRow++;
		}
		else{
			return false;
		}

		t.setCurrentCell(newRow,newCol);
		return true;
	};

	t.getCell= function(r,c){
		return t.rows[r].cells[c];
	};

	t.getCurrentCell= function(){
		return t.getCell(t.r_curr,t.c_curr);
	};

	t.getCellInput= function(r,c){
		return t.getCell(r,c).inputText;
	}

	t.getCellOutput= function(r,c){
		return t.getCell(r,c).elem.innerHTML;
	}

	t.getCurrentCellOutput= function(){
		var curr_cell = t.getCurrentCell();
		return curr_cell.elem.innerHTML;
	};

	t.getCurrentCellInput= function(){
		return t.getCurrentCell().inputText;
	};

	t.setCurrentCell= function(r,c){
		var curr_cell = t.getCurrentCell();
		curr_cell.elem.classList.remove("currentCell");
		tgt_cell = t.getCell(r,c);
		tgt_cell.elem.classList.add("currentCell");
		t.r_curr = r;
		t.c_curr = c;
	};

	t.setCurrentCellInput= function(text){
		var curr_cell = t.getCurrentCell();
		curr_cell.inputText = text;
	};

	t.setCellOutput= function(r,c,text){
		var cell = t.getCell(r,c);
		cell.elem.innerHTML = text;
	};

	t.setCurrentCellOutput= function(text){
		var curr_cell = t.getCurrentCell();
		curr_cell.elem.innerHTML = text;
	};


	t.delSelection= function(){
		var curr_cell = t.getCurrentCell();
		for(var r=0;r<t.r_cnt;r++){
			for(var c=0;c<t.c_cnt;c++){
				var cell = t.getCell(r,c);
				if(cell.elem.classList.contains("selected")){
					cell.elem.classList.remove("selected");
					t.setCellOutput(r,c,"");
				}
			}
		}
	};

	t.render= function(){
		for(var r=0;r<t.r_cnt;r++){
			for(var c=0;c<t.c_cnt;c++){
				var val = t.getCellInput(r,c);
				if(val.charAt(0)=='='){
					t.evaluateCell(r,c,val);
				}
				else{
					t.setCellOutput(r,c,val);
				}
			}
		}
	};

	t.evaluateCell= function(r,c,val){
		var re_num = "(-?[0-9]+)";
		var re_cellPtr = "(([a-j]|[A-J])[0-9])";
		var re_term = "("+re_num+"|"+re_cellPtr+")";
		var re_sum = "sum\\("+re_term+"(,"+re_term+")*"+"\\)";
		var re_avg = "avg\\("+re_term+"(,"+re_term+")*"+"\\)";

		var re_base = "("+re_term+"|"+re_sum+"|"+re_avg+")";

		var re = re_base+"("+"[\\+\\-\\*\\/]"+re_base+")*";
		
		var formula_regex = new RegExp("^="+re+"$","g")
		console.log(val);
		let isValidExpr = formula_regex.test(val);
		if (!isValidExpr){
			t.setCellOutput(r,c,"SYNTAX_ERR");
			return;
		}

		// var re_test = new RegExp("sum\\(1,2\\)","g")
		// var str = "sum(1,2)+6";
		// console.log(re_test.test(str)+"<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
		// return;

		var cellPtr_regex = new RegExp(re_cellPtr,"g")
		var match = null;
		var deref = val;
		while((match = cellPtr_regex.exec(val))!=null){
			let m_idx = match.index;
			let m_rowDesc = match[0].charAt(1);
			let m_colDesc = match[0].charAt(0);
			let m_r = parseInt(m_rowDesc);
			let m_c = parseInt(m_colDesc.charCodeAt(0)) - 97;
			let m_cellVal = t.getCellOutput(m_r,m_c);
			console.log(match[0]);
			deref = deref.replace(new RegExp(match[0],"g"),m_cellVal);
			console.log(deref);
		}

		var sum_regex = new RegExp(re_sum,"g");
		match = null;
		while((match = sum_regex.exec(deref))!=null){
			let m_noSumHeader = match[0].substring(3);
			console.log(m_noSumHeader);
			let m_AdditionFromSum = m_noSumHeader.replace(new RegExp(",","g"),")+(");
			console.log(m_AdditionFromSum);

			console.log(">>>>>>>>>>>>>>>>"+"\\("+match[0].substring(4,match[0].length-1)+"\\)");
			var match_regex = new RegExp("sum\\("+match[0].substring(4,match[0].length-1)+"\\)","g");
			deref = deref.replace(match_regex,m_AdditionFromSum);
			console.log(deref);
		}

		var avg_regex = new RegExp(re_avg,"g");
		match = null;
		while((match = avg_regex.exec(deref))!=null){
			let m_noSumHeader = match[0].substring(3);
			let m_termCnt = (match[0].match(new RegExp(",","g")) || [] ).length+1;
			let m_AdditionFromSum = m_noSumHeader.replace(new RegExp(",","g"),")+(");
			m_AdditionFromSum = "("+"("+m_AdditionFromSum+")/"+m_termCnt+")";
			console.log(m_AdditionFromSum);

			var match_regex = new RegExp("avg\\("+match[0].substring(4,match[0].length-1)+"\\)","g");
			deref = deref.replace(match_regex,m_AdditionFromSum);
			console.log(deref);
		}

		deref = deref.substring(1); //remove exp flag "="
		t.setCellOutput(r,c,eval(deref));
		
	};

	return t;
}

createCalcElem = function(id){
	var c = document.createElement("div");
	c.classList.add("wapCalc");
	c.setAttribute("id","wcalc_"+id);
	return c;
}

initWapCalc = function(r,c){
	var wc = {}
	wc.e_id = genId();
	wc.elem = createCalcElem(wc.e_id);
	
	wc.t = initWapTable(r,c);

	wc.cc = createCellCont();

	wc.elem.appendChild(wc.cc.elem);
	wc.elem.appendChild(wc.t.elem);

	wc.keyDown= function(keyCode){
		if(wc.t.keyDown(keyCode)){
			wc.cc.setInputText(wc.t.getCurrentCellInput());
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
			wc.cellClick(cell);
		}
		return true;
	});

	wc.elem.addEventListener("dblclick", function (e) {
		setActivePageElem(wc);
		e = e || window.event;
		var target = e.target || e.srcElement;
		if(target.classList.contains("wapCell")){
			var cell = target;
			wc.cellClick(cell);
			wc.cc.c_text.focus();
		}
		return true;
	});

	wc.cellClick= function(cellElem){
		var r=parseInt(cellElem.getAttribute("data-row"));
		var c=parseInt(cellElem.getAttribute("data-col"));
		wc.t.setCurrentCell(r,c);
		wc.cc.setInputText(wc.t.getCurrentCellInput());
	}

	wc.cc.del_btn.addEventListener("click",function(e) {
		if(wc.t.getCurrentCell().classList.contains("selected") && wc.t.getCurrentCell().classList.contains("currentCell")){
			wc.cc.setInputText("");
		}
		wc.t.delSelection();
		wc.cc.del_btn.blur();
	});

	wc.cc.c_text.addEventListener("input",function (e) {
		//wc.t.setCurrentCellOutput(wc.cc.getInputText());
	});

	wc.init= function(){
		wc.t.setCurrentCell(0,0);
		wc.cc.setInputText(wc.t.getCurrentCellOutput());
	};
	
	wc.init();

	return wc;
}

// GLOBAL (document) HANDELRS ***************************
const KEYc_D=68,KEYc_SPACE=32,KEYc_ENTER=13,KEYc_ESC=27, KEYc_LEFT=37, KEYc_UP=38, KEYc_RIGHT=39, KEYc_DOWN=40;
document.onkeydown = function(e){
	if (activePageElem==null){ return true;} //not a keydown for our calc
	
	if (activePageElem.cc.c_text==document.activeElement) { 
		if(e.keyCode==KEYc_ESC){
			activePageElem.cc.c_text.blur();
			activePageElem.cc.setInputText(activePageElem.t.getCurrentCellInput());
		}
		else if(e.keyCode==KEYc_ENTER){
			activePageElem.cc.c_text.blur();
			let newInput = activePageElem.cc.getInputText();
			//if (!(newInput == activePageElem.t.getCurrentCellInput())) {
				activePageElem.t.setCurrentCellInput(newInput);
				activePageElem.t.render();
			//}
		}
		return true;
	}

	if(e.keyCode==KEYc_D){
		activePageElem.cc.del_btn.click();
	}

	if(e.keyCode==KEYc_SPACE){
		activePageElem.t.getCurrentCell().classList.toggle("selected");
		return false;
	}

	if(e.keyCode==KEYc_ENTER){
		activePageElem.cc.c_text.focus();
		return false;
	}

	if(e.keyCode==KEYc_LEFT || e.keyCode==KEYc_UP || e.keyCode==KEYc_RIGHT || e.keyCode==KEYc_DOWN){
		activePageElem.keyDown(e.keyCode);
		return false;
	}
	
	return true;
};
// ******************************************************


// TOP-LEVEL COMPONENTS SWITCHING ***********************
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

var activePageElem = null;
// ******************************************************


// MAIN *************************************************
document.addEventListener('DOMContentLoaded', function () {
	var container = document.getElementById("container");
	let wc = initWapCalc(5,3);
	container.appendChild(wc.elem);
	setActivePageElem(wc)
	wc.t.render();
});
// ******************************************************