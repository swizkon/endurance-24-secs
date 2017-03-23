/**
 * Utils dd
 */
jQuery.fn.toObservable = function (eventName, selector) {
	return Rx.Observable.fromEvent(this, eventName, selector);
};


var api = (function () {

	var baseUrl = "../data";

	baseUrl = "http://localhost:3004";

	/*

	
			var promise = $.ajax({
				url: 'https://yaq8h11crk.execute-api.eu-west-1.amazonaws.com/prod/pads?owner=' + encodeURI(inp.val())
			}).promise();
			 */

	return {
		"pads": {

			"createPad": function (title, owner) {
				var pad = {
					"id": new Date().getTime() + "-" + Math.floor(Math.random() * 1000000),
					"title": title,
					"owner": owner,
					"collaborators": [owner]
				};

				return $.ajax({
					url: baseUrl + '/books',
					type: "POST",
					contentType: "application/json",
					data: JSON.stringify(pad)
				}).promise();
			},

			"padsByOwner": function (username) {
				return $.ajax({ url: baseUrl + '/users?key=' + encodeURI(username) }).promise();
			}
		}
	};

} ());



// Flow and such

var event$ = new Rx.Subject();
event$.subscribe(console.log);

var createdPad$ = event$.filter(f => f["PadCreated"]).map(d => d["PadCreated"]);

createdPad$.subscribe(f => console.log(f));


event$.onNext({
	"PadCreated": {
		"title": "My new pad",
		"id": "12345-999"
	}
});
event$.onNext({
	"PadCreated": {
		"title": "My new pad",
		"id": "23456-666"
	}
});
event$.onNext({
	"PadCreated": {
		"title": "My new pad",
		"id": "12345-999"
	}
});

var loginView = new Vue({
	el: '#app-login-view',
	data: {
		loginRequired: true,
		loginStatus: null,
		loginHash: 'Waiting for value...',
		gravatarSrc: ''
	}
});


// var usernameChange$ = Rx.Observable.fromEvent($('#app-login-view form input'), 'change');
var usernameChange$ = $('#app-login-view form input').toObservable('keyup');
//  Rx.Observable.fromEvent($('#app-login-view form input'), 'keyup');

usernameChange$.delay(300)
			   .map(function(evt){
					return evt.target.value;
				})
				.distinctUntilChanged()
				.subscribe(function (d) {
					console.log(d);
					var hash = CryptoJS.MD5(d);
					loginView.gravatarSrc = 'https://www.gravatar.com/avatar/' + CryptoJS.MD5(d).toString();
					loginView.loginHash = hash.toString();
				});


var login$ = Rx.Observable.create(function (observer) {

	$('#app-login-view form').on('submit', function () {
		loginView.loginStatus = 'inprog';
		var f = this;
		var inp = $(f).find('input');

		var doley = Rx.Observable.fromPromise(api.pads.padsByOwner(inp.val()));

		doley.subscribe(function (data) {
			loginView.loginStatus = 'done';
			loginView.loginRequired = false;

			observer.onNext(data);
			// observer.onNext(JSON.parse(data));
		});

		return false;
	});
});

login$.subscribe(function (d) {
	console.log(d);
	mainView.pads = d;
	mainView.authenticated = true;
});



var createdPad$ = Rx.Observable.create(function (observer) {

	$('#app-main-view form').on('submit', function () {
		var f = this;
		var inp = $(f).find('input');

		alert('Form');
		/*event$.onNext({
			"PadCreated": {
				"title": inp.val()
			}
			});
			*/
		// padname, owner
		/*
		var doley = Rx.Observable.fromPromise(api.pads.createPad(inp.val()));

        doley.subscribe(function(data){
			observer.onNext(JSON.parse(data));
        });
		*/
		return false;
	});
});


var mainView = new Vue({
	el: '#app-main-view',
	data: {
		authenticated: false,
		loginStatus: null,
		stateStatus: null,
		pads: []
	}
});



var booksView = new Vue({
	el: '#app-book-view',
	data: {
		books: [],
		selectedBook: { "title": "null" }
	},
	methods: {
		selectBook: function (e) {
			console.log(e);
			this.selectedBook = this.books.filter(function (b) { return b.id === e.target.dataset["bookid"] })[0];
			console.log(this.selectedBook);
			$(document).trigger({
				"type": "bookSelected",
				"book": this.selectedBook
			});
		},
		deleteBook: function(e){
			console.log(e);
			var selectedBook = this.books.filter(function (b) { return b.id === e.target.dataset["bookid"] })[0];
			this.books = this.books.filter(function(b) {return b.id !== e.target.dataset["bookid"] });

			$(document).trigger({
				"type": "bookDeleted",
				"book": selectedBook
			});
		}
	}
});

var tick$ = Rx.Observable.interval(100)
	.take(5)
	.map(function (t) { return new Date().getTime() });

var addedBook$ = new Rx.Subject();
var removedBook$ = new Rx.Subject();

var book$ = Rx.Observable.merge(addedBook$, removedBook$);

tick$.subscribe(function (tick) {
	// console.log(tick);
	var id = tick.toString();
	var book = { "id": id, "title": "Book " + id };
	addedBook$.onNext(book);
});


book$.subscribe(function (book) {
	booksView.books.push(book);
});


var tick2$ = Rx.Observable.interval(2000)
	.map(function (t) { return new Date().getTime() });


var clickStream = Rx.Observable.fromEvent($(document), 'bookSelected');
clickStream.subscribe(console.log);
/*


	var button, clickStream;

		button = document.querySelector('button');
		// console.log(button);
		// alert(button);
		clickStream = Rx.Observable.fromEvent(button, 'click');


	// HERE
	// The 4 lines of code that make the multi-click logic
	var multiClickStream = clickStream
	    .buffer(function() { return clickStream.throttle(250); })
	    .map(function(list) { return list.length; })
	    .filter(function(x) { return x >= 2; });

	// Same as above, but detects single clicks
	var singleClickStream = clickStream
	    .buffer(function() { return clickStream.throttle(300); })
	    .map(function(list) { return list.length; })
	    .filter(function(x) { return x === 1; });

	// Listen to both streams and render the text label accordingly
	singleClickStream.subscribe(function (event) {
	    document.querySelector('h2.singles').textContent = 'SIngle click';
	});

	multiClickStream.subscribe(function (numclicks) {
	    document.querySelector('h2.multies').textContent = ''+numclicks+'x click';
	});
	Rx.Observable.merge(singleClickStream, multiClickStream)
	    .throttle(1000)
	    .subscribe(function (suggestion) {
	        document.querySelector('h2').textContent = '';
	    });


 */
