using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace BACKEND.Swagger;

/// <summary>
/// Swashbuckle 10.x refuses to generate operations when a controller action mixes
/// [FromForm] IFormFile parameters with primitive form parameters. This filter
/// rebuilds the operation so multipart parameters (including IFormFile) are mapped
/// to binary/form schema correctly.
/// </summary>
public class FormFileOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var formParameters = context.ApiDescription.ActionDescriptor.Parameters
            .Where(p => p.BindingInfo?.BindingSource == BindingSource.Form)
            .ToList();

        if (formParameters.Count == 0)
        {
            return;
        }

        var properties = new Dictionary<string, IOpenApiSchema>();
        var required = new HashSet<string>();

        foreach (var parameter in formParameters)
        {
            var name = parameter.Name ?? string.Empty;

            IOpenApiSchema schema;
            if (parameter.ParameterType == typeof(Microsoft.AspNetCore.Http.IFormFile) ||
                parameter.ParameterType == typeof(Microsoft.AspNetCore.Http.IFormFileCollection))
            {
                schema = new OpenApiSchema
                {
                    Type = JsonSchemaType.String,
                    Format = "binary"
                };
            }
            else if (parameter.ParameterType == typeof(int) || parameter.ParameterType == typeof(int?))
            {
                schema = new OpenApiSchema { Type = JsonSchemaType.Integer, Format = "int32" };
            }
            else if (parameter.ParameterType == typeof(long) || parameter.ParameterType == typeof(long?))
            {
                schema = new OpenApiSchema { Type = JsonSchemaType.Integer, Format = "int64" };
            }
            else if (parameter.ParameterType == typeof(bool) || parameter.ParameterType == typeof(bool?))
            {
                schema = new OpenApiSchema { Type = JsonSchemaType.Boolean };
            }
            else if (parameter.ParameterType == typeof(decimal) || parameter.ParameterType == typeof(decimal?) ||
                     parameter.ParameterType == typeof(double) || parameter.ParameterType == typeof(double?) ||
                     parameter.ParameterType == typeof(float) || parameter.ParameterType == typeof(float?))
            {
                schema = new OpenApiSchema { Type = JsonSchemaType.Number };
            }
            else
            {
                schema = new OpenApiSchema { Type = JsonSchemaType.String };
            }

            properties[name] = schema;

            // Only treat as required when the parameter is non-nullable or has a default-nullable wrapper that the action explicitly marks required
            var nullable = Nullable.GetUnderlyingType(parameter.ParameterType) != null || !parameter.ParameterType.IsValueType;
            if (!nullable)
            {
                required.Add(name);
            }
        }

        var mediaSchema = new OpenApiSchema
        {
            Type = JsonSchemaType.Object,
            Properties = properties,
            Required = required
        };

        operation.RequestBody = new OpenApiRequestBody
        {
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType { Schema = mediaSchema }
            }
        };

        operation.Parameters = new List<IOpenApiParameter>();
    }
}