import {Project, SourceFile} from "ts-morph";
import {glob} from 'glob';

const srcDirectory = `D:/tnc-main/src/apps/TessituraWeb/WebAppNG/src/app`;
const moduleFilePaths = await glob(`${srcDirectory}/**/*.module.ts`, { ignore: 'node_modules/**' });
const project = new Project();

moduleFilePaths.forEach( path => {
    const sourceFile = project.addSourceFileAtPath(path);
    removeServicesFromProviders(sourceFile)
});

function removeServicesFromProviders(sourceFile: SourceFile) {
    const moduleImports = sourceFile.getImportDeclarations();

    const tnApiImportDeclarations = moduleImports.filter(
        importDeclaration => importDeclaration.getModuleSpecifierValue() === `tn-api`
    );

    const serviceNames = tnApiImportDeclarations.flatMap(
        importDeclaration => importDeclaration.getNamedImports().map(
            namedImport => namedImport.getName()
        )
    );

    if (serviceNames.length > 0) {
        const ngModuleDecorator = sourceFile.getClasses()[0]?.getDecorator('NgModule');

        const argument = ngModuleDecorator?.getArguments()[0];
        const providersArray = argument && ts.isObjectLiteralExpression(argument) ? argument.asObjectLiteralExpression().getProperty('providers')?.asArrayLiteralExpression() : undefined;


        if (providersArray) {
            serviceNames.forEach(serviceName => {
                providersArray.getElements().forEach((element, index) => {
                    if (element.getText() === serviceName) {
                        providersArray.removeElement(index);
                    }
                });
            });
        }

        tnApiImportDeclarations.forEach(importDeclaration => importDeclaration.remove());
    }
}
