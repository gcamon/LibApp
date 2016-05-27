var myapp = angular.module("myapp",["ngRoute"]);

myapp.config(function($routeProvider){
	$routeProvider

	.when("/",{
		templateUrl: 'assets/pages/login.html',
		controller: 'loginController'
	})

	.when('/signup',{
		templateUrl: 'assets/pages/signup.html',
		controller: 'signupController'
	})

	.when('/terms_and_conditions',{
		templateUrl: 'assets/pages/terms_and_conditions.html',
		controller: 'termsController'
	})


	.when('/user/admin',{
		templateUrl: 'assets/pages/admin.html',
		controller: 'adminController'
	})

	.when('/error',{
		templateUrl: 'assets/pages/error.html',
		controller: 'errorController'
	})
})
/*myapp.factory("membershipNum",["$http",function($http){
	var newUser = {}

	return {
		get: function(){
			return newUser["error"]
		},

		set: function(){
			$http({
			  method: 'GET',
			  url: '/signup'
			}).then(function successCallback(response) {
				if(response){
			    	newUser['error'] = response;
				}	
			    
			  }, function errorCallback(response) {
			    console.log(response)
	  		});
		}
	}
}]);*/

myapp.service("multiData",["$http",function($http){
	this.sendData = function(url,data){
		var fd = new FormData();

		for(var key in data){
			fd.append(key,data[key]);
		};

		$http.post(url,fd,{
			transformRequest: angular.identity,
			headers: {"Content-Type":undefined}
		})

	}

}]);

myapp.directive('fileInput',["$parse",function($parse){

	return {
		restrict: "A",
		link: function(scope,element,attrs){
			var model = $parse(attrs.fileInput); 
			var modelSetter = model.assign;

			element.bind('change',function(){
				scope.$apply(function(){
					modelSetter(scope,element[0].files[0]);
				})
			})
		}
	}

}]);

myapp.controller("loginController",["$scope",function($scope){

}]);

myapp.controller("signupController",["$scope","multiData",function($scope,multiData){

	$scope.userInfo = {};

	$scope.send = function(){
		var uploadUrl = "/signup";
		multiData.sendData(uploadUrl,$scope.userInfo);
	}

}]);

myapp.controller('errorController',["$scope",function($scope){

}])

myapp.controller("termsController",["$scope",function($scope){

}]);

myapp.controller('profileController',["$scope","$http",function($scope,$http){
	
}]);

myapp.controller('adminController',["$scope",function($scope){

}])


/*var a = [2,4,6,8,3];

function process(input){
	var b = input.length - 1;
	var c = true;
	var d = input[b]
	console.log(d)

	while (c) {
		b--
		if(input[b] > d){
			input[b + 1] = input[b]
		} else {
			input[b + 1] = d;
			c = false;
		}
		console.log(input)
	}
}

process(a);*/