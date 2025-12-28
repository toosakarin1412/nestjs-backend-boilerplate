import * as argon2 from 'argon2';
import { User } from './user.entity';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

describe('User Entity', () => {
    it('should hash password and generate UUIDv7 before insert', async () => {
        const user = new User();
        user.password = 'password123';

        await user.beforeInsert();

        // Verify Password Hashing
        expect(user.salt).toBeDefined();
        expect(user.password).not.toEqual('password123');
        const isMatch = await argon2.verify(user.password, 'password123');
        expect(isMatch).toBe(true);

        // Verify UUIDv7
        expect(user.user_uuid).toBeDefined();
        expect(uuidValidate(user.user_uuid)).toBe(true);
        expect(uuidVersion(user.user_uuid)).toBe(7);
    });
});
