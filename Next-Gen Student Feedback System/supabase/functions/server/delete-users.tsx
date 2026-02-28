// SQL function to delete users
export const deleteUserByEmail = `
  CREATE OR REPLACE FUNCTION delete_user_by_email(email_to_delete TEXT)
  RETURNS TABLE(id UUID, email TEXT)
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    RETURN QUERY
    DELETE FROM auth.users 
    WHERE email = email_to_delete::text
    RETURNING id, email;
  END;
  $$;
`;

export const deleteAllUsers = `
  CREATE OR REPLACE FUNCTION delete_all_users()
  RETURNS BIGINT
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
    deleted_count BIGINT;
  BEGIN
    DELETE FROM auth.users WHERE id IS NOT NULL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
  END;
  $$;
`;
