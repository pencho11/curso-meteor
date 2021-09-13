const setUser = (state, user) => {
    state.user = user;
    state.isLogged = true;
};

const logout = (state) => {
    state.user = null;
    state.isLogged = false;
};

export {
    setUser,
    logout
}