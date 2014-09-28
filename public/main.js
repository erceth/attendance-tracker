var app = angular.module('app', ['ui.router', 'ui.bootstrap']);

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("menu");
    
    $stateProvider.state('menu', {
      url: '/menu',
      templateUrl: "view/menu.html",
      controller: "menuCtrl"
    })
    .state('attendee', {
      url: '/attendee/:id',
      templateUrl: "view/attendee.html",
      controller: "attendeeCtrl"
    });
    
});;app.controller('attendeeCtrl', ['$scope', 'api', '$stateParams', function ($scope, api, $stateParams) {
    
    $scope.attendee = {
        id : $stateParams.id
    };
    
    $scope.new = {
        date: new Date(),
        message: ""
    };

    getAttendeeDetails(); //call on page load
    function getAttendeeDetails() {
        api.getAttendeeDetails($scope.attendee.id, function(d) {
            $scope.attendee.fullName    = d.attendees.fullName;
            $scope.attendee.dateJoined  = d.attendees.dateJoined;
            $scope.attendee.messages    = d.attendees.messages;
            $scope.attendee.phoneNumber = d.attendees.phoneNumber;
        });
    }
    

    
    
    $scope.deleteMessage = function(message) {
        var params = {
            id: message._id,
            userID: message._userID
        }
      api.deleteMessage(params, function() {
          console.log('call back');
          getAttendeeDetails();

      });
    };
    
    $scope.addMessage = function() {
        var message = ($scope.new.message) ? $scope.new.message : 'default message';
        var params = {
            id     : $scope.attendee.id,
            date   : $scope.new.date,
            message: message
        }
        api.addMessage(params, function() {
            console.log('call back');
            getAttendeeDetails();
        });
        
    };
    
}]);;app.controller('menuCtrl', ['$scope', 'api', function ($scope, api) {
    
    resetErrors();  //call on page load
    function resetErrors() {
        $scope.errors = [];    
    }
    
    
    api.getAttendees(function(d) {
        $scope.attendees = d.attendees;
        
        //sort alphabeticaly by last name
        $scope.attendees.sort(
            function(a, b) {
                a = a.fullName.split(" ")[1]; //sort only the first column and last name
                b = b.fullName.split(" ")[1];
                if (a.toLowerCase() < b.toLowerCase()) return -1;
                if (a.toLowerCase() > b.toLowerCase()) return 1;
                return 0;
            }
        );
        
    });
    
}]);

;app.factory('api', ['$http', function ($http) {
    return {
        
        getAttendees: function(callback) {
            var request = $http.get('/api/data/9/2014');
            request.success(callback)
            .error(function () {
                console.error("error getting attendees")
            });
        },
        getAttendeeDetails: function(id, callback) {
            var request = $http.get('/api/attendee/' + id);
            request.success(callback)
            .error(function () {
                console.error("error getting attendee details");
            });
        },
        addMessage: function (params, callback) {
            var request = $http.post('/api/attendee/newmessage', params).success(callback)
            .error(function(){
                console.error("error adding message");
            });
            
            
        },

        deleteMessage: function(params, callback) {
            var request = $http.post('api/attendee/deletemessage', params).success(callback)
            .error(function() {
               console.error("error deleting message");
            });
        }
    }
    
}]);