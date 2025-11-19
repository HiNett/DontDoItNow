<?php

namespace App\Security;

use App\Repository\UsersRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

/**
 * Authenticator pour l'authentification par token API
 * 
 * Pour utiliser cet authenticator, envoyez un header:
 * Authorization: Bearer <token>
 * 
 * Ou utilisez un paramètre de requête: ?token=<token>
 */
class TokenAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private readonly UsersRepository $usersRepository
    ) {
    }

    /**
     * Vérifie si cette requête doit être authentifiée
     */
    public function supports(Request $request): ?bool
    {
        // Vérifie si un token est présent dans les headers ou les paramètres
        return $request->headers->has('Authorization') 
            || $request->query->has('token')
            || $request->request->has('token');
    }

    /**
     * Authentifie l'utilisateur
     */
    public function authenticate(Request $request): Passport
    {
        $token = $this->getTokenFromRequest($request);

        if (!$token) {
            throw new AuthenticationException('Token manquant');
        }

        // Ici, vous devriez valider le token (par exemple, vérifier dans une table de tokens)
        // Pour l'instant, on décode le token simple généré par LoginSuccessHandler
        // En production, utilisez un système de tokens JWT ou des tokens stockés en base
        
        // Décode le token base64 (format: email:timestamp)
        $decoded = base64_decode($token, true);
        if ($decoded === false) {
            throw new AuthenticationException('Token invalide');
        }
        
        $parts = explode(':', $decoded, 2);
        if (count($parts) !== 2) {
            throw new AuthenticationException('Token invalide');
        }
        
        [$email, $timestamp] = $parts;
        
        // Vérifie que le token n'est pas trop ancien (par exemple, 24 heures)
        $maxAge = 86400; // 24 heures en secondes
        if (time() - (int)$timestamp > $maxAge) {
            throw new AuthenticationException('Token expiré');
        }
        
        $user = $this->usersRepository->findOneByEmail($email);

        if (!$user) {
            throw new UserNotFoundException('Token invalide');
        }

        return new Passport(
            new UserBadge($user->getUserIdentifier()),
            new PasswordCredentials('') // Pas de vérification de mot de passe ici
        );
    }

    /**
     * Extrait le token de la requête
     */
    private function getTokenFromRequest(Request $request): ?string
    {
        // Vérifie le header Authorization: Bearer <token>
        $authHeader = $request->headers->get('Authorization');
        if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        // Vérifie les paramètres de requête
        if ($request->query->has('token')) {
            return $request->query->get('token');
        }

        // Vérifie les données POST
        if ($request->request->has('token')) {
            return $request->request->get('token');
        }

        return null;
    }

    /**
     * Appelé en cas de succès de l'authentification
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null; // La requête continue normalement
    }

    /**
     * Appelé en cas d'échec de l'authentification
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse([
            'message' => 'Authentification échouée',
            'error' => $exception->getMessage(),
        ], Response::HTTP_UNAUTHORIZED);
    }
}

