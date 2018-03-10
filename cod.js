var err = 0.00001;
var c, ctx;
var punctExtern;
var acoperire, nouArr, arr = [
	// {x: -1, y: -3},
	// {x: 2, y: 0},
	// {x: 4, y: -6},
	// {x: 3, y: -5},
	// {x: 3, y: 12},
	// {x: 2, y: 12},
	// {x: 7, y: 0},
	// {x: -5, y: 0},
	// {x: 12, y: -9},
	// {x: -16, y: 4},
	// {x: 5, y: -10},
	// {x: 13, y: 12},
	// {x: -15, y: -10},
	// {x: 15, y: 11},
	// {x: -1, y: -14},
	// {x: 8, y: 8},
	// {x: -2, y: 11},
	// {x: -8, y: 9},
	// {x: -20, y: 0},
	// {x: 15, y: -2},
	// {x: 15, y: 6},
	// {x: -13, y: -8},
	// {x: -15, y: -2},
	// {x: -4, y: 5},
	// {x: -8, y: 8},
	// {x: -10, y: 6},
	// {x: -23, y: -6},
	// {x: 0, y: -10},
	// {x: 6, y: -13},
	// {x: 6, y: 13}
];

/// PARTEA I
/// Acoperirea convexa a unei multimi de cercuri

/// dat segmentul orientat P1P2, se studiaza natura virajului P1P2P3
///		cu semnificatiile:
///			< 0 viraj dreapta
///			= 0 <=> P3 apartine dreptei suport P1P2
///			> 0 viraj stanga
function testOrientare (P1, P2, P3) {
	return parseFloat (parseFloat ((P2.x - P1.x) * (P3.y - P1.y)) - parseFloat ((P3.x - P1.x) * (P2.y - P1.y)));
}

/// acoperirea convexa prin determinarea marginilor inferioara si superioada
/// se incepe de la cel mai din stanga punct si se merge in sens trigonometric, pastrand viraje stanga
function acoperireConvexa () {

	if (arr.length < 3) {
		alert ('Introduceti mai multe cercuri!');
		return -1;
	}

   	arr.sort (function (a, b) {
    	return a.x == b.x ? a.y - b.y : a.x - b.x;
   	}); 

	var margInf = [];
   	for (let i = 0; i < arr.length; ++i) {

   		//------ asta doar pt a afisa coordonatele la hover ------
   		var punctDiv = document.createElement('div');
		punctDiv.classList.add('punct');
		punctDiv.id = String(i);
		punctDiv.style.left = String(arr[i].x * 20 + 639) + "px";
		punctDiv.style.top = String(arr[i].y * -20 + 359) + "px";
		document.body.appendChild(punctDiv);
		//--------------------------------------------------------

      	while (margInf.length >= 2 && testOrientare (margInf[margInf.length - 2], margInf[margInf.length - 1], arr[i]) <= 0) {
        	margInf.pop();
      	}
      	margInf.push(arr[i]);
   	}

   	var margSup = [];
   	for (let i = arr.length - 1; i >= 0; --i) {
      	while (margSup.length >= 2 && testOrientare (margSup[margSup.length - 2], margSup[margSup.length - 1], arr[i]) <= 0) {
         	margSup.pop();
      	}
      	margSup.push(arr[i]);
   	}

   	margInf.pop();
   	margSup.pop();

   	return margInf.concat(margSup);
}

/// sign : R -> {-1, 0, 1} cu definitia
function sign (x) {
	if (x > 0)
		return 1;
	if (x < 0)
		return -1;
	return 0;
}

/// transformarea punctului consta in determinarea punctului de tangenta
///		pentru o dreapta paralela cu dreapta CP
///		si care depinde de parametrul sgn
///		in sensul ca sgn precizeaza care dintre cele doua puncte posibile se alege
/// sunt tratate separat cazurile
///		ne aflam pe aceeasi verticala 
///			sau
///		ne aflam pe aceeasi orizontala
function transformarePunct (C, P, sgn) {
	if (parseFloat(Math.abs (C.x - P.x)) <= err) {
		x = parseFloat(C.x - sgn);
		y = parseFloat(C.y);
	} 
	else {
		var panta = parseFloat ((C.y - P.y) / (C.x - P.x));
		if (parseFloat (Math.abs(panta)) <= err) {
			x = parseFloat (C.x);
			y = parseFloat (C.y - sgn);
		}
		else {
			var aux = parseFloat (-1 / panta);
			x = parseFloat (C.x + sgn * (1 / Math.sqrt (1 + aux * aux)));
			y = parseFloat (C.y + sgn * (aux / Math.sqrt (1 + aux * aux)));
		}
	}

	var punct = {x: x, y: y};
	return punct;
}

/// functia se refera la determinarea tuturor punctelor de tangenta
/// 	adica are loc o transformare a multimii punctelor de pe frontiera acoperii convexe
///	fiecarui Ai punct din acoperirea convexa ii corespund B(2i) si B(2i+1) din 
///		frontiera acoperirii convexa finala (cea care implica si cercurile)
function transformareMultime (arr) {
	if (arr == -1 || arr == null) {
		alert ('Introduceti mai multe cercuri!');
		return -1;
	}

	var arrTransformat = [];

	for (let i = 0; i < arr.length - 1; ++i) {
		var punctTangenta = transformarePunct (arr[i], arr[i + 1], 1);
		if (parseFloat(testOrientare (arr[i], arr[i + 1], punctTangenta)) < 0) {
			var punctTangenta1 = transformarePunct (arr[i], arr[i + 1], 1);
			var punctTangenta2 = transformarePunct (arr[i + 1], arr[i], 1);
			arrTransformat.push (punctTangenta1);
			arrTransformat.push (punctTangenta2);
		} 
		else {
			var punctTangenta1 = transformarePunct (arr[i], arr[i + 1], -1);
			var punctTangenta2 = transformarePunct (arr[i + 1], arr[i], -1); 
			arrTransformat.push (punctTangenta1);
			arrTransformat.push (punctTangenta2);
		}
	}

	/// cazul de inchidere

	if (arr.length > 1) {
		var punctTangenta = transformarePunct (arr[0], arr[arr.length - 1], 1);
		if (parseFloat(testOrientare (arr[arr.length - 1], arr[0], punctTangenta)) < 0) {
			var punctTangenta1 = transformarePunct (arr[arr.length - 1], arr[0], 1);
			var punctTangenta2 = transformarePunct (arr[0], arr[arr.length - 1], 1);
			arrTransformat.push (punctTangenta1);
			arrTransformat.push (punctTangenta2);			
		}
		else {
			var punctTangenta1 = transformarePunct (arr[arr.length - 1], arr[0], -1);
			var punctTangenta2 = transformarePunct (arr[0], arr[arr.length - 1], -1);
			arrTransformat.push (punctTangenta1);
			arrTransformat.push (punctTangenta2);		
		}
	}

	return arrTransformat;
}

/// PARTEA A II-A
/// Pozitionarea unui punct fata de acoperirea convexa obtinuta

var dist = (A, B) => {
	return parseFloat (Math.sqrt (parseFloat ((A.x - B.x) * (A.x - B.x)) + parseFloat ((A.y - B.y) * (A.y - B.y))));
}

function punctInDisc (centru, punct)
{
	// dat centrul unui disc, verificam daca un punct este cel mult pe suprafata discului 
	//		<=> suprafata acoperirii convexe
	return (parseFloat (dist (centru, punct)) <= parseFloat (1 + err));
}

function punctInTriunghi (A, B, C, punct) {
	/// ABC determina un triunghi
	/// trebuie sa vedem daca este in interior sau nu
	return sign (testOrientare (A, B, C)) == sign (testOrientare (A, B, punct)) &&
			sign (testOrientare (A, C, B)) == sign (testOrientare (A, C, punct)) &&
			sign (testOrientare (B, C, A)) == sign (testOrientare (B, C, punct));
}

function punctPeLatura (A, B, punct) {
	/// verificam daca punct apartine lui AB SEGMENT
	if (testOrientare (A, B, punct) <= err && testOrientare (A, B, punct) >= -err)
		if (A.x <= B.x + err) {
			return (A.x <= punct.x && punct.x <= B.x);
		}
		else if (Math.abs (A.x - B.x) <= err) {
			return (A.y <= punct.y && punct.y <= B.y);
		}
	return false;
}

// alert (punctPeLatura ({x: -1, y: 5}, {x: -1, y: 0}, {x: -1, y: 3}));

function punctInDreptunghi (A, B, C, D, punct) {
	/// verificam daca punct este in ABCD dreptunghi
	/// salvez in obiectul obj rezultatele signaturilor testelor de orientare
	var obj = {
		a1: sign (testOrientare (A, B, C)),
		a2: sign (testOrientare (A, B, punct)),
		b1: sign (testOrientare (B, C, A)),
		b2: sign (testOrientare (B, C, punct)),
		c1: sign (testOrientare (A, D, B)),
		c2: sign (testOrientare (A, D, punct)),
		d1: sign (testOrientare (D, C, A)),
		d2: sign (testOrientare (D, C, punct))
	};
	return (obj.a1 == obj.a2 && obj.b1 == obj.b2 && obj.c1 == obj.c2 && obj.d1 == obj.d2);
}

function pozitiePunct (arr, arrTransformat, punct) {
	/// arr este acoperirea convexa initiala
	/// arrTransformat este acoperirea convexa finala (contine punctele de tangenta)
	var pozitie = {
		locatie: 'exterior',
		delimitare: []
	};
	var n = arr.length;

	/// verificam daca punctul se afla intr-unul dintre discurile unitate
	for (let i = 0; i < n; ++i) {
		if (punctInDisc (arr[i], punct)) {
			pozitie = {
				locatie: 'disc',
				delimitare: [
					arr[i]
				]
			};
			return pozitie;
		}
	}

	/// verificam daca punctul se afla pe o latura a acoperirii convexe
	for (let i = 0; i < arrTransformat.length - 1; i += 2) {
		if (punctPeLatura (arrTransformat[i], arrTransformat[i + 1], punct)) {
			pozitie = {
				locatie: 'segment',
				delimitare: [
					arrTransformat[i], arrTransformat[i + 1]
				]
			};
			return pozitie;
		}
	}

	/// verificam daca punctul se afla in interiorul acoperirii convexe
	///		utilizam o triangulare generata de cel mai din stanga punct
	///		triangularea o facem pentru figura de baza
	for (let i = 1; i < n - 1; ++i) {
		if (punctPeLatura (arr[0], arr[i], punct)) {
			pozitie = {
				locatie: 'segment',
				delimitare: [
					arr[0], arr[i]
				]
			};
			return pozitie;
		}
		if (punctPeLatura (arr[i], arr[i + 1], punct)) {
			pozitie = {
				locatie: 'segment',
				delimitare: [
					arr[i], arr[i + 1]
				]
			};
			return pozitie;
		}
		if (punctPeLatura (arr[0], arr[i + 1], punct)) {
			pozitie = {
				locatie: 'segment',
				delimitare: [
					arr[0], arr[i + 1]
				]
			};
			return pozitie;
		}
		if (punctInTriunghi (arr[0], arr[i], arr[i + 1], punct)) {
			pozitie = {
				locatie: 'triunghi',
				delimitare: [
					arr[0], arr[i], arr[i + 1]
				]
			};
			return pozitie;
		}
	}
	/// ne ramane cazul dreptunghiurilor determinate de centrele cercurilor si punctele de tangenta
	///		de exemplu avem dreptunghiul arr[0], arrTransformat[0], arrTransformat[1], arr[1]
	///		apoi arr[1], arrTransformat[2], arrTransformat[3], arr[2]
	/// 	apoi arr[2], arrTransformat[4], arrTransformat[5], arr[0]

	/// deci, avem, pentru i din {1,...,n-1}, verificarea dreptnghiului
	/// 	arr[i], arrTransformat[2 * i], arrTransformat[2 * i + 1], arr[(i + 1) % n]

	for (let i = 0; i < n; ++i) {
		if (punctPeLatura (arr[i], arrTransformat[2 * i], punct)) {
			pozitie = {
				locatie: 'segment',
				delimitare: [
					arr[i], arrTransformat[2 * i]
				]
			};
			return pozitie;
		}
		if (punctPeLatura (arrTransformat[2 * i], arrTransformat[2 * i + 1], punct)) {
			pozitie = {
				locatie: 'segment',
				delimitare: [
					arrTransformat[2 * i], arrTransformat[2 * i + 1]
				]
			};
			return pozitie;
		}
		if (punctPeLatura (arrTransformat[2 * i + 1], arr [(i + 1) % n], punct)) {
			pozitie = {
				locatie: 'segment',
				delimitare: [
					arrTransformat[2 * i + 1], arr [(i + 1) % n]
				]
			};
			return pozitie;
		}
		if (punctPeLatura (arr [(i + 1) % n], arr[i], punct)) {
			pozitie = {
				locatie: 'segment',
				delimitare: [
					arr [(i + 1) % n], arr[i]
				]
			};
			return pozitie;
		}

		if (punctInDreptunghi (arr[i], arrTransformat [2 * i], arrTransformat [2 * i + 1], arr [(i + 1) % n], punct)) {
			pozitie = {
				locatie: 'dreptunghi',
				delimitare: [
					arr[i], arrTransformat [2 * i], arrTransformat [2 * i + 1], arr [(i + 1) % n]
				]
			};

			return pozitie;
		}
	}

	return pozitie;
}

// ------------------- DESENARE -------------------- //

function adaugarePunct()
{

	var coordonataX = document.getElementById("coordonataX");
	var coordonataY = document.getElementById("coordonataY");

    var xVal = parseFloat(coordonataX.value);
    var yVal = parseFloat(coordonataY.value);

    if (isNaN(xVal) == true || isNaN(yVal) == true)
    {
    	alert("Coordonate invalide!");
    	return;
    }
    else if (xVal > 31 || yVal > 17 || xVal < -31 || yVal < -17)
    {
    	alert("Coordonatele depasesc limita ecranului!");
    	return;
    }

    arr.push({x: xVal, y: yVal});
	
	// Desenare puncte
	// for(var i = 0; i < arr.length; i++){        //daca vreti sa dam exemplu prin cod (pe aici) decomentam for-ul si comentam linia urmatoare
	var i = arr.length - 1;
    ctx.beginPath();
    ctx.arc(arr[i].x * 20 + 640, arr[i].y * -20 + 360, 20, 0, Math.PI * 2, true);
    ctx.stroke();
	// }                                           //de la for
	// ----------------------

}


function desenareAcoperireConvexa() {

	acoperire = acoperireConvexa();

	if(acoperire == -1)
	{
		return;
	}

	document.getElementById("butonDesenareAcoperireConvexa").disabled = true;
	document.getElementById("butonAdaugarePunct").disabled = true;

	document.getElementById("detalii").innerHTML += "Acoperirea convexă a centrelor este următoarea: ";

	// Umplere cercuri de pe acoperirea convexa
	ctx.beginPath();
	for(var i = 0; i < acoperire.length; i++){

		if (i < acoperire.length - 1)
			document.getElementById("detalii").innerHTML += "(" + acoperire[i].x + ", " + acoperire[i].y + "), ";
		else
			document.getElementById("detalii").innerHTML += "(" + acoperire[i].x + ", " + acoperire[i].y + "). " + "<br><br>";

	    ctx.beginPath();
	    ctx.arc(acoperire[i].x * 20 + 640, acoperire[i].y * -20 + 360, 20, 0, Math.PI * 2, true);
	    ctx.fillStyle = "#000";
	    ctx.fill();
	}

	// Tragere linii intre punctele de pe acoperirea convexa
	for(var i = 0; i < acoperire.length - 1; i++){
	    ctx.beginPath();
	    ctx.moveTo(acoperire[i].x * 20 + 640, acoperire[i].y * -20 + 360);
	    ctx.lineTo(acoperire[i + 1].x * 20 + 640, acoperire[i + 1].y * -20 + 360);
	    ctx.stroke();
	}
	ctx.beginPath();
	ctx.moveTo(acoperire[i].x * 20 + 640, acoperire[i].y * -20 + 360);
	ctx.lineTo(acoperire[0].x * 20 + 640, acoperire[0].y * -20 + 360);
	ctx.stroke();
	// ----------------------

	//---------- pentru hover -----------
	$("div").hover(function(){
		var coordonate = document.createElement('div');
		$(this).after(coordonate);
		coordonate.id = "coordonate";
		$("#coordonate").text("(" + arr[$(this).attr('id')].x + ", " + arr[$(this).attr('id')].y + ")");
		$("#coordonate").css("left", String(arr[$(this).attr('id')].x * 20 + 630) + "px");
		$("#coordonate").css("top", String(arr[$(this).attr('id')].y * -20 + 390) + "px");
    }, 

    function(){
    	$("#coordonate").remove();
	});
	//-----------------------------------
}

function desenareFrontiera() {
	
	nouArr = transformareMultime (acoperire);

	if(nouArr == -1)
	{
		return;
	}

	document.getElementById("butonDesenareFrontiera").disabled = true;

	// document.getElementById("detalii").innerHTML += "Frontiera acoperirii convexe a cercurilor este dată de segmentele formate din următoarele puncte de tangență: " + "<br><br>";

	// Tragere frontiere
	for(var i = 0; i < nouArr.length - 1; i += 2){

		// if (i < nouArr.length - 2)
		// 	document.getElementById("detalii").innerHTML += "(" + nouArr[i].x + ", " + nouArr[i].y + ") - (" + nouArr[i + 1].x + ", " + nouArr[i + 1].y + ")," + "<br>";
		// else
		// 	document.getElementById("detalii").innerHTML += "(" + nouArr[i].x + ", " + nouArr[i].y + ") - (" + nouArr[i + 1].x + ", " + nouArr[i + 1].y + ")." + "<br><br>";

	    ctx.beginPath();
	    ctx.moveTo(nouArr[i].x * 20 + 640, nouArr[i].y * -20 + 360);
	    ctx.lineTo(nouArr[i + 1].x * 20 + 640, nouArr[i + 1].y * -20 + 360);

	    ctx.strokeStyle = "#fc0c00";
	    ctx.stroke();
	}
	// ----------------------
}

function desenarePunctExtern() {
	
	var coordonataX = document.getElementById("coordonataXextern");
	var coordonataY = document.getElementById("coordonataYextern");

    var xVal = parseFloat(coordonataX.value);
    var yVal = parseFloat(coordonataY.value);

    if (isNaN(xVal) == true || isNaN(yVal) == true)
    {
    	alert("Coordonate invalide!");
    	return;
    }
    else if (xVal > 31 || yVal > 17 || xVal < -31 || yVal < -17)
    {
    	alert("Coordonatele depasesc limita ecranului!");
    	return;
    }

    punctExtern = {x: xVal, y: yVal};

	document.getElementById("butonAdaugarePunctExtern").disabled = true;
	
	ctx.beginPath();
	ctx.arc(punctExtern.x * 20 + 640, punctExtern.y * -20 + 360, 5, 0, Math.PI * 2, true);
	ctx.fillStyle = "#19fc00";
	ctx.fill();

}

function verificarePunctExtern() {

	if(punctExtern == null)
	{
		alert("Introduceti un punct extern!");
		return;
	}

	document.getElementById("butonVerificarePunctExtern").disabled = true;

	var objPunct = pozitiePunct(acoperire, nouArr, punctExtern);

	console.log(objPunct);

	switch(objPunct.locatie)
	{
		case 'disc':
			ctx.beginPath();
		    ctx.arc(objPunct.delimitare[0].x * 20 + 640, objPunct.delimitare[0].y * -20 + 360, 20, 0, Math.PI * 2, true);
		    ctx.strokeStyle = "#19fc00";
		    ctx.lineWidth = 2;
		    ctx.stroke();
		    document.getElementById("detalii").innerHTML += "Punctul extern se află în interiorul discului de centru (" + objPunct.delimitare[0].x + ", " + objPunct.delimitare[0].y + ")." + "<br>";
			break;
		case 'segment':
			ctx.beginPath();
		    ctx.moveTo(objPunct.delimitare[0].x * 20 + 640, objPunct.delimitare[0].y * -20 + 360);
		    ctx.lineTo(objPunct.delimitare[1].x * 20 + 640, objPunct.delimitare[1].y * -20 + 360);
		    ctx.strokeStyle = "#19fc00";
		    ctx.stroke();
		    document.getElementById("detalii").innerHTML += "Punctul extern se află pe segmentul delimitat de cercurile de centre (" + objPunct.delimitare[0].x + ", " + objPunct.delimitare[0].y + ") si (" + objPunct.delimitare[1].x + ", " + objPunct.delimitare[1].y + ")." + "<br>";
			break;
		case 'triunghi':
			ctx.beginPath();
		    ctx.moveTo(objPunct.delimitare[0].x * 20 + 640, objPunct.delimitare[0].y * -20 + 360);
		    ctx.lineTo(objPunct.delimitare[1].x * 20 + 640, objPunct.delimitare[1].y * -20 + 360);
		    ctx.strokeStyle = "#19fc00";
		    ctx.stroke();

		    ctx.beginPath();
		    ctx.moveTo(objPunct.delimitare[1].x * 20 + 640, objPunct.delimitare[1].y * -20 + 360);
		    ctx.lineTo(objPunct.delimitare[2].x * 20 + 640, objPunct.delimitare[2].y * -20 + 360);
		    ctx.strokeStyle = "#19fc00";
		    ctx.stroke();

		    ctx.beginPath();
		    ctx.moveTo(objPunct.delimitare[0].x * 20 + 640, objPunct.delimitare[0].y * -20 + 360);
		    ctx.lineTo(objPunct.delimitare[2].x * 20 + 640, objPunct.delimitare[2].y * -20 + 360);
		    ctx.strokeStyle = "#19fc00";
		    ctx.stroke();

		    document.getElementById("detalii").innerHTML += "Punctul extern se află pe triunghiul format de cercurile de centre (" + objPunct.delimitare[0].x + ", " + objPunct.delimitare[0].y + "), (" + objPunct.delimitare[1].x + ", " + objPunct.delimitare[1].y + ") si (" + objPunct.delimitare[2].x + ", " + objPunct.delimitare[2].y + ")." + "<br>";
			break;
		case 'dreptunghi':
			ctx.beginPath();
		    ctx.moveTo(objPunct.delimitare[0].x * 20 + 640, objPunct.delimitare[0].y * -20 + 360);
		    ctx.lineTo(objPunct.delimitare[1].x * 20 + 640, objPunct.delimitare[1].y * -20 + 360);
		    ctx.strokeStyle = "#19fc00";
		    ctx.stroke();

		    ctx.beginPath();
		    ctx.moveTo(objPunct.delimitare[1].x * 20 + 640, objPunct.delimitare[1].y * -20 + 360);
		    ctx.lineTo(objPunct.delimitare[2].x * 20 + 640, objPunct.delimitare[2].y * -20 + 360);
		    ctx.strokeStyle = "#19fc00";
		    ctx.stroke();

		    ctx.beginPath();
		    ctx.moveTo(objPunct.delimitare[2].x * 20 + 640, objPunct.delimitare[2].y * -20 + 360);
		    ctx.lineTo(objPunct.delimitare[3].x * 20 + 640, objPunct.delimitare[3].y * -20 + 360);
		    ctx.strokeStyle = "#19fc00";
		    ctx.stroke();

		    ctx.beginPath();
		    ctx.moveTo(objPunct.delimitare[0].x * 20 + 640, objPunct.delimitare[0].y * -20 + 360);
		    ctx.lineTo(objPunct.delimitare[3].x * 20 + 640, objPunct.delimitare[3].y * -20 + 360);
		    ctx.strokeStyle = "#19fc00";
		    ctx.stroke();

		    document.getElementById("detalii").innerHTML += "Punctul extern se află pe dreptunghiul format de cercurile de centre (" + objPunct.delimitare[0].x + ", " + objPunct.delimitare[0].y + "), (" + objPunct.delimitare[1].x + ", " + objPunct.delimitare[1].y + "), (" + objPunct.delimitare[2].x + ", " + objPunct.delimitare[2].y + ") si (" + objPunct.delimitare[3].x + ", " + objPunct.delimitare[3].y + ")." + "<br>";
			break;
		default:

			break;
	}
}

function apasareEnter(evt, thisObj, punct) {
    evt = (evt) ? evt : ((window.event) ? window.event : "")
    if (evt) {
        if ( evt.keyCode == 13 || evt.which == 13 ) {
            var input = document.getElementById('coordonataX');
			input.focus();
			input.select();
            if (punct == "punct")
            	adaugarePunct();
            else if (punct == "punctExtern")
            	desenarePunctExtern();
        }
    }
}

window.onload = function()
{
	console.log(arr);
	c = document.getElementById("cerc");
	ctx = c.getContext("2d");
	// Desenare axe Ox si Oy
	ctx.beginPath();
	ctx.moveTo(0, 360);
	ctx.lineTo(1280, 360);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(640, 0);
	ctx.lineTo(640, 720);
	ctx.stroke();
	// ----------------------
	// Desenare origine
	ctx.beginPath();
	ctx.arc(640, 360, 3, 0, Math.PI * 2, true);
	ctx.fill();
	// ----------------------
}