const User = require('../model/user');
const userController = require('./user');

const Product = require('../model/product');
const Feedstock = require('../model/feedstock');

const productController = {
	index: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		const feedstockColors = await Feedstock.colorList();
		const productColors = await Product.colorList();

		res.render('product/index', { productColors, feedstockColors, user: req.user });
	},
	admin: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		const feedstockColors = await Feedstock.colorList();
		const productColors = await Product.colorList();

		res.render('product/admin', { productColors, feedstockColors, user: req.user });
	},
	production: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		const productColors = await Product.colorList();
		const feedstockStorages = await Feedstock.storageList();

		res.render('product/production', { user: req.user, productColors, feedstockStorages });
	},
	productionSimulate: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.send({ unauthorized: "Você não tem permissão para acessar!" });
		};

		const production = {
			storage_id: req.body.storage_id,
			products: JSON.parse(req.body.products),
			feedstocks: []
		};

		//gettin feedstocks used by every production.products
		// for(i in production.products){
		// 	var product_feedstocks = await Product.feedstockList(production.products[i].id);
		// 	for(j in product_feedstocks){
		// 		production.products[i].feedstocks.push(product_feedstocks[j]);
		// 	};
		// };

		var product_feedstocks_array = [];

		for(i in production.products){
			var product_feedstocks = await Product.feedstockList(production.products[i].id);
			
			for(i in product_feedstocks){
				product_feedstocks_array.push(product_feedstocks[i]);
			};
		};

		product_feedstocks_array = production.products.reduce((array, production_product) => {
			for(i in array){
				if(array[i].product_id == production_product.id){
					array[i].amount = array[i].amount * production_product.amount;
				};
			};
			return array;
		}, product_feedstocks_array);

		var production_feedstocks = [];

		production_feedstocks = product_feedstocks_array.reduce((array, feedstock) => {
			for(i in array){
				if(array[i].feedstock_id == feedstock.feedstock_id){
					array[i].amount += feedstock.amount;
					return array;
				};
			};
			array.push(feedstock);
			return array;
		}, production_feedstocks);

		var feedstocks = [];
		for(i in production_feedstocks){
			var feedstock = await Feedstock.findById(production_feedstocks[i].feedstock_id);
			feedstocks.push(feedstock[0]);
		};

		var storage_feedstocks = [];
		for(i in feedstocks){
			var storage_feedstock = await Feedstock.findInStorage(['storage_id', 'feedstock_id'], [production.storage_id, feedstocks[i].id]);
			storage_feedstocks.push(storage_feedstock[0]);
		};
		
		res.send({ production_feedstocks, feedstocks, storage_feedstocks });
	},
	// API CONTROLLERS
	list: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm', 's/a'])){
			return res.redirect('/');
		};

		Product.list()
			.then(products => {
				res.json(products);
			})
			.catch(err => {
				return console.log(err);
			});
	},
	findById: async (req, res) => {
		// if(!await userController.verifyAccess(req, res, ['adm', 's/a'])){
		// 	return res.redirect('/');
		// };

		try {
			const product = await Product.findById(req.params.id);
			if(product.length){
				product[0].images = await Product.getImages(product[0].id);
			};
			res.send({ product });
		} catch (err){
			console.log(err);
			res.send({ msg: err });
		};
	},
	findByCode: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm', 's/a'])){
			return res.redirect('/');
		};

		let product = await Product.findByCode(req.params.code);

		if(product.length){
			product[0].images = await Product.getImages(product[0].id);
			product[0].feedstocks = await Product.getFeedstocks(product[0].id);
		};

		res.send(product);
	},
	findByName: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm', 's/a'])){
			return res.redirect('/');
		};

		let products = await Product.findByName(req.query.name);
		if(products.length){
			products[0].images = await Product.getImages(products[0].id);
			products[0].feedstocks = await Product.getFeedstocks(product[0].id);
		};

		res.send(products);
	},
	filter: async (req, res) => {
		// if(!await userController.verifyAccess(req, res, ['adm', 's/a'])){
		// 	return res.redirect('/');
		// };

		var params = [];
		var values = [];

		if(isNaN(req.query.code) || req.query.code < 0 || req.query.code > 9999){
			req.query.code = "";
		};

		if(req.query.code){
			params.push("code");
			values.push(req.query.code);
		};

		if(req.query.color){
			params.push("color");
			values.push(req.query.color);
		};

		if(req.query.name){
			const products = await Product.filter(req.query.name, params, values);
			res.send({ products });
		} else {
			const products = await Product.filter(false, params, values);
			res.send({ products });
		};
	},
	remove: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		await Product.remove(req.query.id);
		await Product.removeProductImages(req.query.id);
		await Product.removeProductFeedstocks(req.query.id);
		
		res.send({ done: 'Produto excluído com sucesso!' });
	},
	addImage: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm', 's/a'])){
			return res.redirect('/');
		};

		const image = {
			product_id: req.query.product_id,
			url: req.query.image_url
		};

		await Product.addImage(image);
	
		res.send({ done: 'Imagem adicionada com sucesso!' });
	},
	removeImage: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		await Product.removeImage(req.query.id);

		res.send({ done: 'Imagem excluída!' });
	},
	feedstockAdd: async(req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		const insertion = {
			id: req.body.id,
			product_id: req.body.product_id,
			feedstock_id: req.body.feedstock_id,
			amount: parseFloat(req.body.feedstock_amount)
		};

		if(!insertion.id || insertion.id < 1){
			try {
				await Product.addFeedstock(insertion);
				res.send({ done: "Matéria-Prima adicionada com sucesso." });
			} catch (err) {
				console.log(err);
				res.send({ msg: err });
			};
		} else {
			try {
				await Product.updateFeedstock(insertion);
				res.send({ done: "Matéria-Prima atualizada com sucesso." });
			} catch (err) {
				console.log(err);
				res.send({ msg: err });
			};
		};

	},
	feedstockRemove: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		await Product.removeFeedstock(req.query.id);

		res.send({ done: 'Matéria-prima excluída!' });
	},
	feedstockList: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		try {
			var feedstocks = [];
			const product_feedstocks = await Product.feedstockList(req.params.id);
			for(i in product_feedstocks){
				var feedstock = await Feedstock.findById(product_feedstocks[i].feedstock_id);
				feedstocks.push(feedstock[0]);
			};
			res.send({ product_feedstocks, feedstocks });
		} catch (err) {
			console.log(err);
			res.send({ msg: err });
		};
	},
	options: (req, res, next) => {
		res.status(204).send("");
	},

	/////////////////////////////////////////////
	
	// PRODUCTS APLICATION CONTROLLERS
	save: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		const product = {
			id: parseInt(req.body.id),
			code: parseInt(req.body.code),
			name: req.body.name,
			color: req.body.color,
			size: req.body.size
		};

		if(!product.code || product.code < 1 || product.code > 9999){return res.send({ msg: 'Código de produto inválido.' })};
		if(!product.name || product.name.length > 15){return res.send({ msg: 'Preencha o nome do produto.' })};
		if(!product.color || product.color.length > 10){return res.send({ msg: 'Preencha a cor do produto.' })};
		if(!product.size || product.size.length > 3){return res.send({ msg: 'Preencha o tamanho do produto.' })};

		if(!product.id){
			var row = await Product.findByCode(product.code);
			if(row.length){return res.send({ msg: 'Este código de produto já está cadastrado.' })};
			
			var row = await Product.save(product);
			let newProduct = await Product.findById(row.insertId);
			res.send({ done: 'Produto cadastrado com sucesso!', product: newProduct });
		} else {
			var row = await Product.findByCode(product.code);
			if(row.length){
				if(row[0].id != product.id){
					return res.send({ msg: 'Este código de produto já está cadastrado.' });
				};
			};
			
			var row = await Product.update(product);
			let newProduct = await Product.findById(row.insertId);
			res.send({ done: 'Produto atualizado com sucesso!', product: newProduct });
		};
	},
	
	categorySave: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		const category = {
			name: req.body.product_category_name,
			shortcut: req.body.product_category_shortcut
		};

		await Product.categorySave(category);

		res.send({ done: 'Categoria cadastrada com sucesso!' });
	},
	categoryList: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm', 's/a'])){
			return res.redirect('/');
		};

		const categories = await Product.categoryList();

		res.send({ categories });
	},
	colorSave: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm'])){
			return res.redirect('/');
		};

		const color = {
			name: req.body.color_name,
			shortcut: req.body.color_shortcut			
		};

		await Product.colorSave(color);

		res.send({ done: 'Cor cadastrada com sucesso!' });
	},
	colorList: async (req, res) => {
		if(!await userController.verifyAccess(req, res, ['adm', 's/a'])){
			return res.redirect('/');
		};
		
		const colors = await Product.colorList();

		res.send(colors);
	}
};

module.exports = productController;