var app = angular.module('budgetn', ['LocalStorageModule', 'googlechart', 'ngMaterial']);

app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('budgetn');
}).value('googleChartApiConfig', {
    version: '1',
    optionalSettings: {
        packages: ['corechart'],
        language: 'en'
    }
});



app.controller('BalanceSheet', ['$scope','localStorageService', function($scope, localStorageService){

    // methods hoisted from below
    $scope.resetLedger = resetLedger;
    $scope.resetLineItemForm = resetLineItemForm;
    $scope.addLineItem = addLineItem;
    $scope.sumIntervals = sumIntervals;
    $scope.removeItem = removeItem;
    $scope.save = save;
    $scope.deleteLedger = deleteLedger;

    // interval list, array ordered
    $scope.intervals = [
        { label : 'Hourly',  toDay : 24 / 1 },
        { label : 'Daily',   toDay : 1 },
        { label : 'Weekly',  toDay : 1/7 },
        { label : 'Monthly', toDay : 12/365 },
        { label : 'Yearly',  toDay : 1/365 }
    ];

    $scope.labels = [
        { label : 'Income' },
        { label : 'Food' },
        { label : 'Housing' },
        { label : 'Auto' }
    ];

    // init application
    load();
    resetLineItemForm();
    sumIntervals();
    buildCharts();

    // methods of the controller, will be hoisted
    function addLineItem( coefficient ){
        if(validateLineItemForm()) {
            $scope.lineItemForm.value *= coefficient;
            $scope.ledger.push($scope.lineItemForm);
            resetLineItemForm();
            sumIntervals();
            buildCharts();
        }
    }

    function validateLineItemForm(){
        $scope.lineItemForm.value = parseFloat($scope.lineItemForm.value, 10).toFixed(2)
       return (
            $scope.lineItemForm.label !== undefined &&
            $scope.lineItemForm.interval !== undefined
       );
    }



    function resetLineItemForm(){
        $scope.lineItemForm = {
            interval : 0
        };
    }

    function resetLedger(){
        $scope.ledger = [];
    }

    function sumInterval( index ){
        var sum = 0;
        for(var i = 0; i < $scope.ledger.length; i++){
            sum += $scope.ledger[i].value * $scope.intervals[$scope.ledger[i].interval].toDay / $scope.intervals[index].toDay;
        }
        $scope.intervals[index].sum = sum;
        return sum;
    }

    function sumIntervals ( ){
        for(var i=0; i < $scope.intervals.length; i++){
            sumInterval(i);
        }
    }

    function removeItem( index ){
        $scope.ledger.splice( index, 1);
        sumIntervals();
        buildCharts();
    }

    function saveLedger(){
        localStorageService.set('Ledger', $scope.ledger);
    }

    function loadLedger(){
        $scope.ledger = localStorageService.get('Ledger');
        if( !angular.isArray($scope.ledger) ){
            resetLedger();
        }
    }

    function saveIntervals(){
        localStorageService.set('Intervals', $scope.intervals);
    }

    function loadIntervals(){
        var ints = localStorageService.get('Intervals');
        if(angular.isArray(ints)){
           $scope.intervals = ints;
        }else{
            saveIntervals();
        }
    }

    function saveLabels(){
        localStorageService.set('Labels', $scope.labels);
    }

    function loadLabels(){
        var labels = localStorageService.get('Labels');
        if(angular.isArray(labels)){
            $scope.labels = labels;
        }else{
            saveLabels();
        }
    }

    function save(){
        saveLedger();
        saveIntervals();
        saveLabels();
    }

    function load(){
        loadLedger();
        loadIntervals();
        loadLabels();
    }

    function deleteLedger(){
        resetLedger();
        saveLedger();
    }

    function buildExpenseChart(){

        var expenseChart = {
            type : 'PieChart',
            options : {
                title : 'Daily Expenses',
                backgroundColor : '#F2F0DF'
            },
            data : {
                "cols": [
                    {id: "t", label: "Expense", type: "string"},
                    {id: "s", label: "Cost", type: "number"}
                ],
                "rows": []
            }
        };

        var dataHash = {};

        for( var i =0; i < $scope.ledger.length; i++){
            if($scope.ledger[i].value <= 0) {
                dataHash[$scope.labels[$scope.ledger[i].label].label] = dataHash[$scope.labels[$scope.ledger[i].label].label] || {c: [{v: $scope.labels[$scope.ledger[i].label].label}, {v: 0}]};
                dataHash[$scope.labels[$scope.ledger[i].label].label].c[1].v +=  parseFloat((-1* parseFloat($scope.ledger[i].value,2) * $scope.intervals[$scope.ledger[i].interval].toDay).toFixed(2));

            }
        }

        for( label in dataHash ){
            expenseChart.data.rows.push(dataHash[label]);
        }

        $scope.expenseChart = expenseChar;
    }

    function buildCharts(){
        buildExpenseChart();
    }

    function buildNetTimelineChart(){

    }

}]);


