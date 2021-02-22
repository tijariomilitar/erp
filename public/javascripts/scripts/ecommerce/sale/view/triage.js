Ecommerce.sale.view.triage = {};

Ecommerce.sale.view.triage.filter = (sales, pagination) => {
	let html = "";
	if(sales.length){
		html += "</div>";
		for(let i in sales){
			if(sales[i].status == "Ag. Embalo"){
				html += "<div class='box one container ground padding-5 margin-top-5 margin-bottom-5 shadow'>";
					html += "<div class='box one container'>";
					html += "<div class='mobile-box four center margin-top-5 tbl-show-link nowrap' onclick='Ecommerce.sale.controller.triage.show(`"+sales[i].id+"`)'><h4>"+sales[i].code+"</h4></div>";
					html += "<div class='mobile-box four center margin-top-5'>"+sales[i].origin+"</div>";
					html += "<div class='mobile-box four center margin-top-5'>"+lib.timestampToDate(sales[i].datetime)+"</div>";
					html += "<div class='mobile-box four center margin-top-5'>"+sales[i].status+"</div>";
					html += "</div>";
					html += "<div class='box one container'>";
					html += "<div class='mobile-box four center margin-top-5'>"+sales[i].customer_name+"</div>";
					html += "<div class='mobile-box four center margin-top-5'>"+sales[i].customer_user+"</div>";
					html += "<div class='mobile-box four center margin-top-5'>"+sales[i].user_name+"</div>";
					html += "<div class='mobile-box four center margin-top-5'>"+sales[i].tracker+"</div>";
					html += "</div>";
				html += "</div>";
			}
		};
		document.getElementById("ecommerce-sale-filter-box").style.display = "";
		document.getElementById("ecommerce-sale-filter-box").innerHTML = html;
	} else {
		html += "<div class='box one center padding-10 margin-top-5 margin-bottom-5 shadow'>Nenhuma venda encontrada</div>";
		document.getElementById("ecommerce-sale-filter-box").style.display = "";
		document.getElementById("ecommerce-sale-filter-box").innerHTML = html;
	};
};

Ecommerce.sale.view.triage.show = (sale) => {
	console.log(sale);
};