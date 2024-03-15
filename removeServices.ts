import { Project } from "ts-morph";
import * as glob from "glob";

// Initialize a new ts-morph Project
const project = new Project();

// Specify the path to the Angular project's src directory
const srcDirectory = "<path-to-your-angular-project>/src";

// Find all .module.ts files
glob(`${srcDirectory}/**/*.module.ts`, (er, files) => {
    files.forEach((file) => {
        const sourceFile = project.addSourceFileAtPath(file);
        removeServicesFromProviders(sourceFile);
    });

    // Save the changes
    project.saveSync();
});

function removeServicesFromProviders(sourceFile) {
    // Find all import declarations from 'tn-api'
    const importsToRemove = sourceFile.getImportDeclarations((declaration) => {
        return declaration.getModuleSpecifierValue() === 'tn-api';
    });

    const serviceNames = importsToRemove.flatMap((importDeclaration) => {
        return importDeclaration.getNamedImports().map((namedImport) => namedImport.getName());
    });

    if (serviceNames.length > 0) {
        // Find the providers array within @NgModule decorator
        const ngModuleDecorator = sourceFile.getClasses()[0]?.getDecorator('NgModule');
        const providersArray = ngModuleDecorator?.getArguments()[0]?.asObjectLiteralExpression()?.getProperty('providers')?.asArrayLiteralExpression();

        if (providersArray) {
            // Remove the services from the providers array
            serviceNames.forEach((serviceName) => {
                providersArray.getElements().forEach((element, index) => {
                    if (element.getText() === serviceName) {
                        providersArray.removeElement(index);
                    }
                });
            });
        }

        // Remove the import statements
        importsToRemove.forEach((importDeclaration) => importDeclaration.remove());
    }
}
