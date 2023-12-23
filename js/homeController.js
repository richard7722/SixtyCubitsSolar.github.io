

var app = angular.module('myApp', []);

app.controller('myCtrl', function ($scope,$window) {

    $scope.details={};
    $scope.showValue = false;
    $scope.details.voltage = 12;
    $scope.details.bat_eff = 0.75;
    $scope.details.systemType = "On Grid";
    $scope.calculate = function () {
        if ($scope.details.total_load != undefined && $scope.details.hours != undefined) {
            $scope.details.cTotal_load = $scope.details.total_load * 1000;
            $scope.details.inverter = $scope.details.cTotal_load + 1000;
            $scope.details.load_power = Math.ceil($scope.details.cTotal_load / $scope.details.voltage);
            $scope.details.battery = Math.ceil(($scope.details.cTotal_load * $scope.details.hours) / ($scope.details.voltage * $scope.details.bat_eff));
            $scope.details.battery_power = Math.ceil(($scope.details.battery * 10) / 100);
            $scope.details.total_current = $scope.details.load_power + $scope.details.battery_power;
            $scope.details.solar_plant = $scope.details.voltage * $scope.details.total_current;
            $scope.details.total_solar_plant = Math.ceil($scope.details.solar_plant / 400);
            $scope.showValue = true;
        }
        else $scope.showValue = false;
    };

    $scope.getReport = function () {

         localStorage.setItem("details",JSON.stringify($scope.details))
        var data = $window.open("download.html","_blank");

    }

});

app.controller('dwnldCtlr', function ($scope) {

    $scope.pdfDetails = JSON.parse(localStorage.getItem("details"));

    $scope.hideIcon=false;
    $scope.hideOnGrid=$scope.pdfDetails.systemType == 'On Grid' ? true : false;
    $scope.hideOffGrid=$scope.pdfDetails.systemType == 'Off Grid' ? true : false;

    $scope.pdfDetails.dailyAvg = $scope.pdfDetails.total_load * 4.18;
    $scope.pdfDetails.annually = $scope.pdfDetails.dailyAvg * 365;

    $scope.downloadPDF=function() {

        $scope.hideIcon=true;

                html2canvas(document.body, {
                    onrendered: function(canvas) {
                        var data = canvas.toDataURL();
                        $scope.hideIcon=false;
                        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
                        const imgProps= pdf.getImageProperties(data);
                        const width = pdf.internal.pageSize.getWidth();
                        const ratio = width/ imgProps.width;
                        const height = ratio * imgProps.height;
                        pdf.addImage(data, 'PNG', 0, 0, width, height);
                        location.reload();
                        pdf.save("download.pdf");                
                    } ,
                });
 

    }

});

app.filter('INR', function () {        
    return function (input) {
        if (! isNaN(input)) {
            const rupeeOptions = {
              style: "currency",
              currency: "INR",
              currencyDisplay: "name",
              maximumFractionDigits: 2
            }
            let rupee = input.toLocaleString("en-IN", rupeeOptions).replace("Indian rupees", "Rs");
            return rupee
        }
    }
});