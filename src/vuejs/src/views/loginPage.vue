<template>
    <div class="login-container">
        <displayPong></displayPong>
        <buttonLogin></buttonLogin>
        <recoveryToken></recoveryToken>
    </div>
</template>

<script>
import displayPong from './displayPong';
import buttonLogin from './buttonLogin';
import recoveryToken from './recoveryToken';

export default {
    components: {
        displayPong,
        buttonLogin,
        recoveryToken
    },
};
</script>