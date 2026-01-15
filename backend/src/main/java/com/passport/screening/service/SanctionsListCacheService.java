@PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> manualRefresh() {
        logger.info("Manual cache refresh requested");
        try {
            cacheService.manualRefresh();
            return ResponseEntity.ok(Map.of(
                "status", "refresh_initiated",
                "timestamp", LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            logger.error("Manual refresh failed", e);
            return ResponseEntity.status(500).build();
        }
    }
