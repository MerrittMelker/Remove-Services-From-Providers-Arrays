import { ObjectLiteralExpression, Project, SourceFile, SyntaxKind } from "ts-morph";
import { glob } from 'glob';

const srcDirectory = `D:/tnc-main/src/apps/TessituraWeb/WebAppNG/src/app`;
const moduleFilePaths = await glob(`${srcDirectory}/**/*.module.ts`, { ignore: 'node_modules/**' });
const project = new Project();

moduleFilePaths.forEach( async path => {
    const sourceFile = project.addSourceFileAtPath(path);
    await removeServicesFromProviders(sourceFile)
});

async function removeServicesFromProviders(sourceFile: SourceFile) {
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
        const moduleArguments = ngModuleDecorator?.getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
        const providersProperty = moduleArguments?.getProperty('providers').asKind(SyntaxKind.PropertyAssignment);

        if (providersProperty) {
            serviceNames.forEach(serviceName => {
                const providersArrayExpression = providersProperty.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
                const providerElements = providersArrayExpression?.getElements();

                for(let i = providerElements.length - 1; i >= 0; i--) {
                    const element = providerElements[i];
                    const elementText = element.getText();
                    if (elementText === serviceName) {
                        providersArrayExpression.removeElement(i);
                    }
                }
            });
        }

        tnApiImportDeclarations.forEach(importDeclaration => importDeclaration.remove());
        await sourceFile.save();
    }
}
