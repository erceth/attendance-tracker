app.controller('menuCtrl', ['$scope', 'api', function ($scope, api) {
    
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

