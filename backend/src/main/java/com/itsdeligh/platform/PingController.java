package com.itsdeligh.platform;

import com.itsdeligh.platform.common.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PingController {

    @GetMapping("/ping")
    public ApiResponse<Void> ping() {
        return ApiResponse.success("Deligh Campus API is running");
    }
}