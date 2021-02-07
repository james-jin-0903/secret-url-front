<template>
    <v-app>
        <v-row>
            <v-col cols="12">

                <v-card max-width="800" class="action-card">
                    <v-card-title>
                        <v-icon>mdi-lock-check</v-icon>
                        Create secret:
                    </v-card-title>

                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-textarea
                                        v-model="secretText"
                                        label="Secret text"
                                        rows="3"
                                        required
                                ></v-textarea>
                            </v-col>

                            <v-col cols="12">
                                <v-text-field
                                        v-model="views"
                                        type="number"
                                        label="Expire after views"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12">
                                <v-menu
                                        ref="menu"
                                        v-model="menu"
                                        :close-on-content-click="false"
                                        :return-value.sync="date"
                                        transition="scale-transition"
                                        offset-y
                                        min-width="290px"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field
                                                v-model="date"
                                                label="Picker in menu"
                                                prepend-icon="mdi-calendar"
                                                readonly
                                                v-bind="attrs"
                                                v-on="on"
                                        ></v-text-field>
                                    </template>
                                    <v-date-picker
                                            v-model="date"
                                            no-title
                                            scrollable
                                    >
                                        <v-spacer></v-spacer>
                                        <v-btn
                                                text
                                                color="primary"
                                                @click="menu = false"
                                        >
                                            Cancel
                                        </v-btn>
                                        <v-btn
                                                text
                                                color="primary"
                                                @click="$refs.menu.save(date)"
                                        >
                                            OK
                                        </v-btn>
                                    </v-date-picker>
                                </v-menu>
                            </v-col>

                            <v-col cols="12">
                                <v-btn @click="saveSecret" color="primary">Save</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <v-card max-width="800" class="action-card">
                    <v-card-title>
                        <v-icon>mdi-lock-open-variant</v-icon>&nbsp;
                        Show secret:
                    </v-card-title>

                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field
                                        v-model="showHash"
                                        label="Secret Hash"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="12">
                                <v-btn @click="showSecret" color="primary">Show</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-dialog
                v-model="loading"
                hide-overlay
                persistent
                width="300"
        >
            <v-card
                    class="loading-card"
                    color="primary"
                    dark
            >
                <v-card-text>
                    Please stand by
                    <v-progress-linear
                            indeterminate
                            color="white"
                            class="mb-0"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
                v-model="resultDialog"
                width="600"
        >
            <v-card class="result-card">
                <v-card-title class="headline grey lighten-2">
                    Secret Hash
                </v-card-title>

                <v-card-text>
                    {{ createdSecret.hash }}
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            text
                            @click="resultDialog = false"
                    >
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
                v-model="showingDialog"
                width="800"
        >
            <v-card class="result-card">
                <v-card-title class="headline grey lighten-2">
                    Secret
                </v-card-title>

                <v-card-text>
                    <v-simple-table>
                        <template v-slot:default>
                            <tbody>
                            <tr>
                                <td>Secret Text</td>
                                <td>{{ showingSecret.secretText }}</td>
                            </tr>
                            <tr>
                                <td>Hash</td>
                                <td>{{ showingSecret.hash }}</td>
                            </tr>
                            <tr>
                                <td>Remaining views</td>
                                <td>{{ showingSecret.remainingViews || 'Unlimited' }}</td>
                            </tr>
                            <tr>
                                <td>Expire time</td>
                                <td>
                                    {{
                                    showingSecret.expiresAt
                                    ? new Date(showingSecret.expiresAt).toString() :
                                    'Unlimited'
                                    }}
                                </td>
                            </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            text
                            @click="showingDialog = false"
                    >
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
                v-model="showingError"
                width="600"
        >
            <v-card class="error-card">
                <v-card-title class="headline grey lighten-2">
                    Error
                </v-card-title>

                <v-card-text>
                    {{ showingErrorMessage }}
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            text
                            @click="showingError = false"
                    >
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'App',

        components: {},

        data: () => ({
            secretText: '',
            views: '',
            menu: false,
            date: '',
            loading: false,
            resultDialog: false,
            createdSecret: {},
            showHash: '',
            showingSecret: {},
            showingDialog: false,
            showingError: false,
            serverError: false,
            showingErrorMessage: '',
        }),

        methods: {
            async saveSecret() {
                this.loading = true;

                try {
                    const {data} = await axios.post(`${process.env.VUE_APP_SERVER_ADDR}/api/secret`, {
                        secret: this.secretText,
                        expireAfterViews: this.views ? this.views : null,
                        expireAfter: this.date ? new Date(this.date).getTime() : null,
                    });

                    this.createdSecret = data;
                    this.resultDialog = true;
                } catch (e) {
                    console.log(e)
                } finally {
                    this.loading = false;
                }
            },

            async showSecret() {
                this.loading = true;

                try {
                    const hash = encodeURIComponent(this.showHash);
                    const {data} = await axios.get(`${process.env.VUE_APP_SERVER_ADDR}/api/secret/${hash}`);

                    this.showingSecret = data;
                    this.showingDialog = true;
                } catch (e) {
                    this.showingError = true;
                    if (e.response.status === 404) {
                        this.showingErrorMessage = 'Secret with given hash not found';
                    } else if (e.response.status === 410) {
                        this.showingErrorMessage = 'The secret is gone!';
                    } else {
                        this.showingErrorMessage = 'Internal server error occurred'
                    }
                } finally {
                    this.loading = false;
                }
            }
        }
    };
</script>

<style>
    body, .v-application {
        background-color: #26c6da !important;
    }

    .action-card.v-card {
        margin-top: 20px;
        margin-right: auto;
        margin-left: auto;
    }

    .action-card .v-card__title .v-icon {
        margin-right: 10px;
    }

    .action-card .v-card__text {
        padding: 0 35px 25px !important;
    }

    .loading-card {
        padding-top: 10px;
    }

    .result-card .v-card__text {
        padding-top: 20px !important;
        text-align: center;
    }

    .error-card .v-card__text {
        padding-top: 20px !important;
    }
</style>
