import {Project, SourceFile} from "ts-morph";
import {glob} from 'glob';

const srcDirectory = `D:/tnc-main/apps/TessituraWeb/src/app`;
const moduleFilePaths = await glob([`${srcDirectory}/**/*.module.ts`]);
const project = new Project();
moduleFilePaths.forEach( path => {
    const sourceFile = project.addSourceFileAtPath(path);
    removeServicesFromProviders(sourceFile)
});

function removeServicesFromProviders(sourceFile: SourceFile) {
    const moduleImports = sourceFile.getImportDeclarations();
    const tnApiImport = moduleImports.find(
        importDeclaration => importDeclaration.getModuleSpecifierValue() === `tn-api`
    );
    
    // const importsToRemove = sourceFile.getImportDeclarations((declaration) => {
    //     return declaration.getModuleSpecifierValue() === 'tn-api';
    // });

    // const serviceNames = importsToRemove.flatMap((importDeclaration) => {
    //     return importDeclaration.getNamedImports().map((namedImport) => namedImport.getName());
    // });
    //
    // if (serviceNames.length > 0) {
    //     // Find the providers array within @NgModule decorator
    //     const ngModuleDecorator = sourceFile.getClasses()[0]?.getDecorator('NgModule');
    //     const providersArray = ngModuleDecorator?.getArguments()[0]?.asObjectLiteralExpression()?.getProperty('providers')?.asArrayLiteralExpression();
    //
    //     if (providersArray) {
    //         // Remove the services from the providers array
    //         serviceNames.forEach((serviceName) => {
    //             providersArray.getElements().forEach((element, index) => {
    //                 if (element.getText() === serviceName) {
    //                     providersArray.removeElement(index);
    //                 }
    //             });
    //         });
    //     }
    //
    //     // Remove the import statements
    //     importsToRemove.forEach((importDeclaration) => importDeclaration.remove());
    // }
}
