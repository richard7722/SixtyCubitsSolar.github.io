

var app = angular.module('myApp', ['ngMaterial']);

app.controller('myCtrl', function ($scope,$window,$filter,$timeout) {

    $scope.details={};
    $scope.showValue = false;
    $scope.details.voltage = 12;
    $scope.details.bat_eff = 0.75;
    $scope.details.systemType = "On Grid";
    $scope.showBattery = false;
    $scope.calculate = function () {
        if($scope.details.hours === null)
            $scope.details.hours = undefined;
        if ($scope.details.total_load !== undefined && ($scope.details.systemType === "On Grid" || $scope.details.hours !== undefined)) {
            $scope.details.cTotal_load = $scope.details.total_load * 1000;
            $scope.details.inverter = $scope.details.cTotal_load + 1000;
            $scope.details.load_power = $scope.details.cTotal_load / $scope.details.voltage;
            if ($scope.details.systemType == "On Grid") {
                $scope.details.hours=undefined;
                $scope.details.total_current = $scope.details.load_power;
                $scope.details.battery = '-';
                $scope.showBattery = false;
            } else {
                $scope.details.battery = ($scope.details.cTotal_load * $scope.details.hours) / ($scope.details.voltage * $scope.details.bat_eff);
                $scope.details.battery_power = ($scope.details.battery * 10) / 100;
                $scope.details.total_current = $scope.details.load_power + $scope.details.battery_power;
                $scope.showBattery = true;
            }           
            $scope.details.solar_plant = $scope.details.voltage * $scope.details.total_current;
            $scope.details.total_solar_plant = Math.ceil($scope.details.solar_plant / 550);
            $scope.showValue = true;
        }
        else {
            $scope.showValue = false;
        }        
    }

    $scope.areaCalculate = function () {
        $scope.details.areaUnit = $scope.selectedItem.opt;
        let areaConvertVal = $filter('filter')($scope.areaValues, {'label': $scope.selectedItem.value})[0].value;
        let areaSqm = $scope.details.area * areaConvertVal;
        let solarPanelArea = 2.116638; //2.063 * 1.026
        let neededPanels = Math.ceil(areaSqm/solarPanelArea);
        $scope.details.total_load = neededPanels * 550 / 1000;
        $scope.calculate();
    }

    $scope.getReport = function () {

        localStorage.setItem("details",JSON.stringify($scope.details))
        var data = $window.open("download.html","_blank");

    }

    $scope.areas=[
        {value:'sqft',label:'square feet (ft²)',opt:'ft²'},
        {value:'sqm',label:'square meter (m²)', opt:'m²'},
        {value:'ground',label:'ground', opt:'ground'},        
        {value:'sqyd',label:'square yard (yd²)',opt:'yd²'}
    ];

    $scope.areaValues = [
        {label:'sqft', value: 0.092903},
        {label:'sqm', value: 1},        
        {label:'sqyd', value: 0.836127},
        {label: 'ground', value: 223}
    ];

    $scope.selectedItem={}
    $scope.selectedItem = $scope.areas[0];

});

app.controller('dwnldCtlr', function ($scope) {

    $scope.pdfDetails = JSON.parse(localStorage.getItem("details"));

    $scope.hideIcon = false;
    $scope.hideArea = true;
    $scope.hideOnGrid=$scope.pdfDetails.systemType == 'On Grid' ? true : false;
    $scope.hideOffGrid=$scope.pdfDetails.systemType == 'Off Grid' ? true : false;

    $scope.pdfDetails.dailyAvg = $scope.pdfDetails.total_load * 4.18;
    $scope.pdfDetails.annually = $scope.pdfDetails.dailyAvg * 365;

    if ($scope.pdfDetails.area > 0) {
        $scope.hideArea = false;
    }

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
                        pdf.save($scope.pdfDetails.compDt + "- Estimation.pdf");                
                    } ,
                });
 

    }

    //$scope.downloadPDF();   

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