(function () {
    type Values = {
        alreadyDeclared: boolean;
setOnObject?: boolean;
laterAssignedInObject?: null;
quicklyAssigned?: undefined;
quicklyAssignedInConstructor?: boolean;
initiallyThere?: boolean;
passedInFunction?: string;
    };

    class Container<T> {
        values: T;

        constructor(valuesIn: T) {
            this.values = valuesIn;
        }

        receive(values: T) { }
    }

    const container = new Container<Values>({
        alreadyDeclared: true,
        quicklyAssignedInConstructor: true,
    })

    function valuesFunction<T>(values: T) { }
    
    valuesFunction<Values>({ passedInFunction: "someString", });

    container.receive({ receiveInObjectLiteral: 3 });

    container.values = { setOnObject: true };

    container.values.laterAssignedInObject = null;

    new Container<Values>({
        alreadyDeclared: true,
        initiallyThere: true,
    }).values.quicklyAssigned = undefined;

    type SecondType = {
        secondMemberIn: boolean;
secondMemberConstructor?: string;
    };

    new Container<SecondType>({
        secondMemberIn: true,
        secondMemberConstructor: "text",
    });
})();