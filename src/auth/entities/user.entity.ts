import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
    // Nota: No es necesario definir el _id, ya que Mongoose lo crea por defecto
    _id?: string; // Para evitar errores de compilación, se define como opcional

    @Prop({required: true})
    name: string;

    @Prop({unique: true, required: true})
    email: string;
    
    @Prop({minlength: 6, required: true})
    password?: string;

    @Prop({default: true})
    isActive: boolean;

    @Prop({type: [String], default: ['user']}) //['admin', 'user']
    roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
