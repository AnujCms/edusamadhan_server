const swaggerJSDoc = require('swagger-jsdoc');

function swagger() {
    const swaggerDefinition = {
        openapi: "3.0.0",
        components: {
            securitySchemes:
            {
                LoginSecurity:
                {
                    type: 'apiKey',
                    name: 'x-access-token',
                    in: 'header'
                }
            }
        },
        info: {
            title: 'Node Swagger API',
            version: '1.0.0',
            description: 'Demonstrating how to describe a RESTFULL API with Swagger',
        },
        servers:
            [{
                url: '/api',
                description: 'The api end point for users.'
            }]
    }
    // options for the swagger docs
    const options = {
        // import swaggerDefinitions
        swaggerDefinition: swaggerDefinition,
        // path to the API docs
        apis: [
            __dirname + '/api/ProviderAuthService.js',
            __dirname + '/api/PrincipalService.js',
            __dirname + '/api/TeacherService.js',
            __dirname + '/api/StudentFeeService.js',
            __dirname + '/api/EntranceExamService.js',
            __dirname + '/api/StudentService.js',
            __dirname + '/api/TimeTableService.js',
            __dirname + '/api/NotificationsService.js',
            __dirname + '/api/EventsService.js',
            __dirname + '/api/LogbookService.js'

        ]// pass all in array
    };
    return swaggerJSDoc(options)
}
exports.swagger = swagger