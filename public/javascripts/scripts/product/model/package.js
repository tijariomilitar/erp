Product.package = {};

Product.package.save = async (package) => {
	let response = await fetch("/product/package/save", {
		method: "POST",
		headers: {'Content-Type':'application/json'},
	    body: JSON.stringify({ package })
	});
	response = await response.json();

	if(API.verifyResponse(response)){ return false };
	alert(response.done);

	return response.package;
};

Product.package.filter = async (package) => {
	let response = await fetch("/product/package/filter?code="+package.code+"&name="+package.name+"&color="+package.color);
	response = await response.json();

	if(API.verifyResponse(response)){ return false };

	return response.packages;
};

Product.package.findById = async (id) => {
	let response = await fetch("/product/package/id/" + id);
	response = await response.json();
	
	if(API.verifyResponse(response)){ return false };
	
	return response.package[0];
};

Product.package.delete = async (id) => {
	let response = await fetch("/product/package/delete?id="+id, { method: 'DELETE' });
	response = await response.json();

	if(API.verifyResponse(response)){ return false };
	alert(response.done);
	
	return true;
};

Product.package.product = {};

Product.package.product.update = async (package) => {
	let response = await fetch("/product/package/product/update", {
		method: "POST",
		headers: {'Content-Type':'application/json'},
	    body: JSON.stringify({ package })
	});
	response = await response.json();

	if(API.verifyResponse(response)){ return false };
	alert(response.done);

	return response.package;
};

Product.package.image = {};

Product.package.image.add = async (package_id, image_url) => {
	let response = await fetch("/product/package/image/add", {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
	    body: JSON.stringify({ package_id: package_id, image_url: image_url })
	});
	response = await response.json();

	if(API.verifyResponse(response)){ return false };
	alert(response.done);

	return package_id;
};

Product.package.image.remove = async (image_id) => {
	let response = await fetch("/product/package/image/remove?image_id="+image_id, { method: 'DELETE' });
	response = await response.json();

	if(API.verifyResponse(response)){ return false };
	alert(response.done);
	
	return true;
};