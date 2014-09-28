app.factory('api', ['$http', function ($http) {
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