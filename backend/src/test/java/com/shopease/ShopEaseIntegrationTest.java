package com.shopease;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the ShopEase API.
 * Runs against the local development database and Redis.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class ShopEaseIntegrationTest {

        @Autowired
        MockMvc mockMvc;

        @Autowired
        ObjectMapper objectMapper;

        // ─── Context ──────────────────────────────────────────────────────────────

        @Test
        void contextLoads() {
                // Spring application context should start successfully
        }

        // ─── Products API ─────────────────────────────────────────────────────────

        @Test
        void getProducts_returnsOkAndList() throws Exception {
                mockMvc.perform(get("/api/v1/products")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        void getProducts_noAuthRequired() throws Exception {
                mockMvc.perform(get("/api/v1/products"))
                                .andExpect(status().isOk());
        }

        @Test
        void getProduct_seedDataExistsWithId1() throws Exception {
                mockMvc.perform(get("/api/v1/products/1")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.name").isNotEmpty())
                                .andExpect(jsonPath("$.price").isNumber());
        }

        @Test
        void getProduct_nonExistentId_returns404() throws Exception {
                mockMvc.perform(get("/api/v1/products/99999")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isNotFound());
        }

        // ─── Categories API ───────────────────────────────────────────────────────

        @Test
        void getCategories_returnsOkAndList() throws Exception {
                mockMvc.perform(get("/api/v1/categories")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$").isArray());
        }

        @Test
        void getCategories_noAuthRequired() throws Exception {
                mockMvc.perform(get("/api/v1/categories"))
                                .andExpect(status().isOk());
        }

        // ─── Auth API ─────────────────────────────────────────────────────────────

        @Test
        void register_withValidPayload_returns201() throws Exception {
                String payload = objectMapper.writeValueAsString(Map.of(
                                "name", "Test User",
                                "email", "integrationtest_" + System.currentTimeMillis() + "@shopease.com",
                                "password", "Test@1234"));

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(payload))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.accessToken").isNotEmpty());
        }

        @Test
        void register_duplicateEmail_returns400() throws Exception {
                String email = "duplicate_" + System.currentTimeMillis() + "@shopease.com";
                String payload = objectMapper.writeValueAsString(Map.of(
                                "name", "Test User",
                                "email", email,
                                "password", "Test@1234"));

                // First registration succeeds
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(payload))
                                .andExpect(status().isCreated());

                // Second registration with same email should fail
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(payload))
                                .andExpect(status().is4xxClientError());
        }

        @Test
        void login_withValidCredentials_returnsToken() throws Exception {
                String email = "logintest_" + System.currentTimeMillis() + "@shopease.com";
                String password = "Test@1234";

                // Register first
                String registerPayload = objectMapper.writeValueAsString(Map.of(
                                "name", "Login Tester",
                                "email", email, "password", password));
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(registerPayload));

                // Login
                String loginPayload = objectMapper.writeValueAsString(Map.of(
                                "email", email, "password", password));

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginPayload))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.accessToken").isNotEmpty());
        }

        @Test
        void login_withWrongPassword_returns401() throws Exception {
                String loginPayload = objectMapper.writeValueAsString(Map.of(
                                "email", "nobody@shopease.com",
                                "password", "wrongpassword"));

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginPayload))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void protectedEndpoint_withoutToken_returns401() throws Exception {
                mockMvc.perform(get("/api/v1/cart")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void protectedEndpoint_withValidToken_returns200() throws Exception {
                String email = "tokentest_" + System.currentTimeMillis() + "@shopease.com";
                String password = "Test@1234";

                // Register
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "name", "Token Test",
                                                "email", email, "password", password))));

                // Login to get token
                MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of("email", email, "password", password))))
                                .andExpect(status().isOk())
                                .andReturn();

                String token = (String) objectMapper
                                .readValue(loginResult.getResponse().getContentAsString(), Map.class)
                                .get("accessToken");

                // Access protected endpoint with token
                mockMvc.perform(get("/api/v1/cart")
                                .header("Authorization", "Bearer " + token)
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk());
        }

}
