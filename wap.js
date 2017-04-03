//VUTBR FIT WAP - Tabulkovy kalkulator
//Author: Jan Kubis/xkubis13
function rand(){
	return Math.floor(Math.random() * 10) + 1 ; 
}

function genId(){
	var length = 5;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

createCellInputElem = function(){

	var ci = {};

	ci.c_text = document.createElement("input");
	ci.c_text.setAttribute("type","text");
	ci.c_text.classList.add("ciInput");

	ci.del_btn = document.createElement("input");
	ci.del_btn.setAttribute("type","button");
	ci.del_btn.setAttribute("value","DEL");
	ci.del_btn.classList.add("delBtn");

	ci.elem = document.createElement("div");
	ci.elem.appendChild(ci.del_btn);
	ci.elem.appendChild(ci.c_text);

	ci.getInputText = function(){
		return ci.c_text.value;
	}
	ci.setInputText = function(text){
		ci.c_text.value = text;
	}

	return ci;
}


createTableElem = function(rows){
	var r_cnt = rows.length;
	var c_cnt = rows[0].cells.length;
	
	var t = document.createElement("table");
	t.setAttribute("class", "wapTable");
	var tr = document.createElement("tr"); //table row for headers
	for (var c=0;c<c_cnt+1;c++){ //col headers
		var tdh = document.createElement("th");
		tdh.innerHTML = String.fromCharCode(c+96); //ASCII 'a' offset
		tdh.setAttribute("class", "wapColHeader");
		tr.appendChild(tdh);
	}
	t.appendChild(tr)
	for(var r=0;r<r_cnt;r++){
		tr = document.createElement("tr");
		tr.setAttribute("class", "wapRow");
		var trh = document.createElement("th"); //row headers
		trh.innerHTML = r;
		trh.setAttribute("class", "wapRowHeader");
		tr.appendChild(trh);
		for(var c=0;c<c_cnt;c++){
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

initWapCell = function(r,c) {

	let cell = {};
	
	cell.r = r;
	cell.c = c;
	cell.isSelected = false;
	cell.inputText = ""+rand();
	if(cell.r==0 && cell.c==0){
		cell.inputText = "=avg(b0,c0)"
	}
	cell.elem = createCellElem(cell);

	cell.getInput=function(){
		return cell.inputText;
	}

	cell.getOutput= function(){
		return cell.elem.innerHTML;
	}

	cell.setInput= function(text){
		cell.inputText = text;
	};

	cell.setOutput= function(text){
		cell.elem.innerHTML = text;
	};

	cell.toggleSelection= function(){
		if(cell.isSelected){
			cell.isSelected = false;
			cell.elem.classList.remove("selected");
		}
		else{
			cell.isSelected = true;
			cell.elem.classList.add("selected");
		}
	};

	cell.delClick= function(){
		cell.setInput("");
		cell.setOutput("");
	}

	return cell;
}

initWapTable = function(r,c) {
	var t = {};
	t.r_cnt= r;
	t.c_cnt= c;

	t.r_curr= 0;
	t.c_curr= 0;

	t.rows= [];
	for(let r=0;r<t.r_cnt;r++){ //create cells
		let row = {};
		row.cells=[];
		for(let c=0;c<t.c_cnt;c++){
			row.cells.push(initWapCell(r,c));
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

	t.getCurrentCellOutput= function(){
		var curr_cell = t.getCurrentCell();
		return curr_cell.elem.innerHTML;
	};

	t.getCurrentCellInput= function(){
		return t.getCurrentCell().inputText;
	};

	t.setCurrentCell= function(r,c){
		let curr_cell = t.getCurrentCell();
		let tgt_cell = t.getCell(r,c);
		curr_cell.elem.classList.remove("currentCell");
		tgt_cell.elem.classList.add("currentCell");
		t.r_curr = r;
		t.c_curr = c;
	};

	t.setCurrentCellOutput= function(text){
		var curr_cell = t.getCurrentCell();
		curr_cell.elem.innerHTML = text;
	};

	t.setCurrentCellInput= function(text){
		var curr_cell = t.getCurrentCell();
		curr_cell.inputText = text;
	};


	t.delSelection= function(){
		for(var r=0;r<t.r_cnt;r++){
			for(var c=0;c<t.c_cnt;c++){
				var cell = t.getCell(r,c);
				if(cell.isSelected){
					cell.toggleSelection();
					cell.delClick();
				}
			}
		}
		t.refresh();
	};

	t.refresh= function(){
		let val_old="", val_new="";
		let isModified=true,i=0;
		while(isModified){
			isModified=false;
			for(var r=0;r<t.r_cnt;r++){
				for(var c=0;c<t.c_cnt;c++){
					val_old = t.getCell(r,c).getOutput();
					t.evaluateCell(r,c);
					val_new = t.getCell(r,c).getOutput();
					if(val_old!=val_new){
						isModified=true;
					}
				}
			}

			if(i++>100){break;} //cross-reference guard
		}
	}

	t.evaluateCell= function(r,c){
		let val = t.getCell(r,c).getInput();
		if(val.charAt(0)!='='){
			t.getCell(r,c).setOutput(val);
			return;
		}

		var re_num = "(-?[0-9]+(.[0-9]+)?)";
		var re_cellPtr = "(([a-j]|[A-J])[0-9])";
		var re_term = "("+re_num+"|"+re_cellPtr+")";
		var re_sum = "sum\\("+re_term+"(,"+re_term+")*"+"\\)";
		var re_avg = "avg\\("+re_term+"(,"+re_term+")*"+"\\)";

		var re_base = "("+re_term+"|"+re_sum+"|"+re_avg+")";

		var re = re_base+"("+"[\\+\\-\\*\\/]"+re_base+")*";
		
		var formula_regex = new RegExp("^="+re+"$","g")
		let isValidExpr = formula_regex.test(val);
		if (!isValidExpr){
			t.getCell(r,c).setOutput("SYNTAX_ERR");
			return;
		}

		var cellPtr_regex = new RegExp(re_cellPtr,"g")
		var match = null;
		var deref = val;
		while((match = cellPtr_regex.exec(val))!=null){
			let m_idx = match.index;
			let m_rowDesc = match[0].charAt(1);
			let m_colDesc = match[0].charAt(0);
			let m_r = parseInt(m_rowDesc);
			let m_c = parseInt(m_colDesc.charCodeAt(0)) - 97;
			let m_cellVal = t.getCell(m_r,m_c).getOutput();
			deref = deref.replace(new RegExp(match[0],"g"),m_cellVal);
		}

		var sum_regex = new RegExp(re_sum,"g");
		match = null;
		while((match = sum_regex.exec(deref))!=null){
			let m_noSumHeader = match[0].substring(3);
			let m_AdditionFromSum = m_noSumHeader.replace(new RegExp(",","g"),")+(");

			var match_regex = new RegExp("sum\\("+match[0].substring(4,match[0].length-1)+"\\)","g");
			deref = deref.replace(match_regex,m_AdditionFromSum);
		}

		var avg_regex = new RegExp(re_avg,"g");
		match = null;
		while((match = avg_regex.exec(deref))!=null){
			let m_noSumHeader = match[0].substring(3);
			let m_termCnt = (match[0].match(new RegExp(",","g")) || [] ).length+1;
			let m_AdditionFromSum = m_noSumHeader.replace(new RegExp(",","g"),")+(");
			m_AdditionFromSum = "("+"("+m_AdditionFromSum+")/"+m_termCnt+")";

			var match_regex = new RegExp("avg\\("+match[0].substring(4,match[0].length-1)+"\\)","g");
			deref = deref.replace(match_regex,m_AdditionFromSum);
		}

		deref = deref.substring(1); //remove exp flag "="
		t.getCell(r,c).setOutput(eval(deref));
		
	};

	return t;
}

createCalcElem = function(id){
	var c = document.createElement("div");
	c.classList.add("wapCalc");
	c.setAttribute("id","wcalc_"+id);
	return c;
}

createHelpElem= function(){
	var e = document.createElement("div");
	e.classList.add("help");

	let helpText= "ARROWS navigate"
	helpText+= "<br/>ENTER enter edit mode / leave edit mode && confirm changes";
	helpText+= "<br/>ESC leave edit mode && revert changes";
	helpText+= "<br/>SPACE select/deselect current cell";
	helpText+= "<br/>CLICK change current / DBL CLICK change current && enter edit mode";
	e.innerHTML= helpText
	

	return e;
}

initWapCalc = function(r,c){
	var wc = {}
	wc.e_id = genId();
	wc.elem = createCalcElem(wc.e_id);
	
	wc.t = initWapTable(r,c);

	wc.ci = createCellInputElem();

	wc.elem.appendChild(wc.ci.elem);
	wc.elem.appendChild(wc.t.elem);
	wc.elem.appendChild(createHelpElem());

	wc.keyDown= function(keyCode){
		if(wc.t.keyDown(keyCode)){
			wc.ci.setInputText(wc.t.getCurrentCellInput());
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
			wc.ci.c_text.focus();
		}
		return true;
	});

	wc.cellClick= function(cellElem){

		let curr_cell = activePageElem.t.getCurrentCell();
		activePageElem.t.evaluateCell(curr_cell.r,curr_cell.c);

		var r=parseInt(cellElem.getAttribute("data-row"));
		var c=parseInt(cellElem.getAttribute("data-col"));
		wc.t.setCurrentCell(r,c);
		wc.ci.setInputText(wc.t.getCurrentCellInput());
	}

	wc.ci.del_btn.addEventListener("click",function(e) {
		if(wc.t.getCurrentCell().isSelected){
			wc.ci.setInputText("");
		}
		wc.t.delSelection();
		wc.ci.del_btn.blur();
	});

	wc.ci.c_text.addEventListener("input",function (e) {
		wc.t.setCurrentCellOutput(wc.ci.getInputText());
	});

	wc.init= function(){
		wc.t.setCurrentCell(0,0);
		wc.ci.setInputText(wc.t.getCurrentCellOutput());
	};
	
	wc.init();

	return wc;
}

// GLOBAL (document) HANDELRS ***************************
const KEYc_D=68,KEYc_SPACE=32,KEYc_ENTER=13,KEYc_ESC=27, KEYc_LEFT=37, KEYc_UP=38, KEYc_RIGHT=39, KEYc_DOWN=40;
document.onkeydown = function(e){
	let ape = activePageElem;
	if (ape==null){ return true;} //not a keydown for our calc
	
	if (ape.ci.c_text==document.activeElement) { 
		if(e.keyCode==KEYc_ESC){
			ape.ci.c_text.blur();
			ape.ci.setInputText(ape.t.getCurrentCellInput());
			let curr_cell = ape.t.getCurrentCell();
			ape.t.evaluateCell(curr_cell.r,curr_cell.c);
		}
		else if(e.keyCode==KEYc_ENTER){
			ape.ci.c_text.blur();
			let curr_cell = ape.t.getCurrentCell();
			let newInput = ape.ci.getInputText();
			//if (!(newInput == ape.t.getCurrentCellInput())) {
				ape.t.setCurrentCellInput(newInput);
				ape.t.evaluateCell(curr_cell.r,curr_cell.c);
				//ape.t.setCurrentCellOutput(newInput);
				ape.t.refresh();
			//}
		}
		return true;
	}

	if(e.keyCode==KEYc_D){
		ape.ci.del_btn.click();
	}

	if(e.keyCode==KEYc_SPACE){
		ape.t.getCurrentCell().toggleSelection();
		return false;
	}

	if(e.keyCode==KEYc_ENTER){
		ape.ci.c_text.focus();
		return false;
	}

	if(e.keyCode==KEYc_LEFT || e.keyCode==KEYc_UP || e.keyCode==KEYc_RIGHT || e.keyCode==KEYc_DOWN){
		ape.keyDown(e.keyCode);
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
	wc.t.refresh();
});
// ******************************************************