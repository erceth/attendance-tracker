app.controller('attendeeCtrl', ['$scope', 'api', '$stateParams', function ($scope, api, $stateParams) {
    
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
    
}]);