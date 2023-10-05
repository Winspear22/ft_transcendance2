<template>
    <div>
        <div class="block-dm-button" @click="confirmBlock">✖</div>
        <!-- Confirmation Modal -->
        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <p>Voulez-vous bloquer les DM de {{ username }} ? Cela entraînera la suppression de cette personne de votre liste d'amis.</p>
                <button @click="blockUser">Confirmer</button>
                <button @click="closeModal">Annuler</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BlockDM',

    props: {
        chat: {
            type: Object,
            required: true,
            default: () => ({})
        },
        userInfo: {
            type: Object,
            required: true,
            default: () => ({})
        }
    },

    data() {
        return {
            showModal: false
        };
    },

    computed: {
        username() {
            const otherUser = this.chat.users.find(u => u.username !== this.userInfo.username);
            return otherUser ? otherUser.username : "Unknown";
        }
    },

    methods: {
        confirmBlock() {
            this.showModal = true;
        },
        blockUser() {
            this.$emit('block', this.chat);
            this.closeModal();
        },
        closeModal() {
            this.showModal = false;
        }
    }
};
</script>

<style scoped>
.block-dm-button {
    cursor: pointer;
    color: #2fe8ee;
    margin-left: 10px;
    transition: color 0.3s;
}

.block-dm-button:hover {
    color: black;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: linear-gradient(#2fe8ee, #2459d5); /* Fond en dégradé */
    color: white;
    padding: 20px;
    border-radius: 10px;
    width: 300px;
    text-align: center;
}

.modal-content button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: transparent; /* Fond transparent pour voir le dégradé */
    color: #2fe8ee;
    border: 1px solid #2fe8ee;
    border-radius: 5px;
    transition: background-color 0.3s, color 0.3s;
}

.modal-content button:hover {
    color: black; /* Survol du bouton : texte noir */
}
</style>
