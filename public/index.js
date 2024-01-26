const text = document.getElementById('text');
const prog = '"Be a saviour just by donating your blood, and be the reason for someones existence ...."';
let idx = 1;

setInterval(typingText, 150);

function typingText() {
	text.innerText = prog.slice(0, idx);
	idx++;

	if (idx > prog.length) {
		idx = 1;
	}
}


$('.icon').click(function () {
	$('.menu1').slideToggle(500);
});

//checking or matching password into reguistartion page


function checkpass() {
	let pass1 = document.getElementById("password").value;
	let pass2 = document.getElementById("password1").value;

	if (pass1 != pass2) {
		document.getElementById("warning").style.display = "block";
	}
	if (pass1 == pass2) {
		document.getElementById("warning").style.display = "none";
	}
}


//Disabling button on date 
function disablebtn(nextdate,turn,myphone) {
	let dt = new Date();
	let date = dt.getDate();
	let month = dt.getMonth() + 1;
	let year = dt.getFullYear();
	let d = new Date(`${month} ${date},${year}`);
	let currentdt = new Date(nextdate);
	console.log(currentdt);
	console.log(d);
	console.log(turn);
	console.log(myphone);
	if (nextdate === "Invalid Date") {
		console.log("I am running bro "+turn);
		document.getElementById('donatea').style.display = 'block';
		document.getElementById('donatebnt').style.display = 'none';
		document.getElementById('donatespan').style.display = 'none';
	}
	else {
		if (currentdt >= nextdate) {
			document.getElementById('donatea').style.display = 'block';
			document.getElementById('donatebnt').style.display = 'none';
			document.getElementById('donatespan').style.display = 'none';
		}
		else {
			document.getElementById('donatebnt').style.display = 'none';
			document.getElementById('donatespan').style.display = 'block';
		}
	}
}