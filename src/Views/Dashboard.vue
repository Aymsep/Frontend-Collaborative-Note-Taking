<template>
   <Spinner :visible="loading" />
   <ProfileDrop />
   <NoteContainer />
</template>

<script setup>
import NoteContainer from '../components/Notes/NoteContainer.VUE';
import ProfileDrop from '../components/common/ProfileDrop.vue';
import Spinner from '../components/common/Spinner.vue';
import {useUserStore } from '../Store/user.Store'


const {loading} = useUserStore();



</script>

<style lang="scss" scoped>

</style>